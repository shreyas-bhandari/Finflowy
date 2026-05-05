from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import os
from pymongo import MongoClient
from datetime import datetime

# ── scikit-learn real ML models ──────────────────────────────────────────────
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import IsolationForest, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

app = FastAPI(title="FinFlowy AI Microservice — Real ML Edition", version="2.0.0")

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27018/ml_finflowy")
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    alerts_collection = db["alert_logs"]
    predictions_collection = db["predictions"]
except Exception as e:
    print(f"Failed to connect to ML MongoDB: {e}")
    alerts_collection = None
    predictions_collection = None

# ── Pydantic Models ───────────────────────────────────────────────────────────
class Transaction(BaseModel):
    id: Optional[str] = None
    amount: float
    type: str
    category: str
    date: str
    description: Optional[str] = None

class PredictExpenseRequest(BaseModel):
    userId: str
    transactions: List[Transaction]

class BehaviorAnalysisRequest(BaseModel):
    userId: str
    transactions: List[Transaction]

class Goal(BaseModel):
    id: Optional[str] = None
    name: str
    targetAmount: float
    currentAmount: float
    probability: Optional[float] = None
    deadline: str

class GoalPredictionRequest(BaseModel):
    goal: Goal
    history: List[Transaction]

class SpendingPatternRequest(BaseModel):
    userId: str
    transactions: List[Transaction]

class BudgetRecommendationRequest(BaseModel):
    userId: str
    transactions: List[Transaction]

# ─────────────────────────────────────────────────────────────────────────────
#  HEALTH
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "finance-ml-service",
        "version": "2.0.0",
        "models": [
            "LinearRegression (expense forecast)",
            "IsolationForest (anomaly detection)",
            "GradientBoostingRegressor (goal achievement)",
            "KMeans (spending pattern clustering)",
            "Ridge (budget recommendation)",
        ]
    }

# ─────────────────────────────────────────────────────────────────────────────
#  MODEL 1 — Linear Regression: Next-Month Expense Forecast
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/ml/predict-expense")
def predict_expense(req: PredictExpenseRequest):
    """
    REAL ML: Trains a LinearRegression model on monthly expense totals.
    Feature: month index (1, 2, 3…)
    Target: total expense that month
    Predicts the next month's total expense.
    """
    expenses = [t for t in req.transactions if t.type == 'expense']
    if not expenses:
        return {"predictedExpense": 0, "message": "No expense data", "model": "LinearRegression"}

    df = pd.DataFrame([{"amount": t.amount, "date": pd.to_datetime(t.date)} for t in expenses])
    df['month'] = df['date'].dt.to_period('M')
    monthly = df.groupby('month')['amount'].sum().reset_index()
    monthly['month_idx'] = range(1, len(monthly) + 1)

    if len(monthly) < 2:
        # Not enough data — return simple estimate
        return {
            "predictedExpense": round(float(monthly['amount'].iloc[0]) * 1.05, 2),
            "confidence": "low",
            "model": "LinearRegression",
            "message": "Need more months of data for higher confidence",
            "monthsUsed": len(monthly)
        }

    # ── Train Linear Regression ───────────────────────────────────────────────
    X = monthly[['month_idx']].values
    y = monthly['amount'].values

    model = LinearRegression()
    model.fit(X, y)

    next_month_idx = len(monthly) + 1
    predicted = float(model.predict([[next_month_idx]])[0])
    predicted = max(predicted, 0)

    # R² score as a confidence proxy
    r2 = model.score(X, y)
    confidence = "high" if r2 > 0.7 else "medium" if r2 > 0.4 else "low"

    # Trend direction
    slope = float(model.coef_[0])
    trend = "increasing" if slope > 50 else "decreasing" if slope < -50 else "stable"

    result = {
        "status": "success",
        "predictedExpense": round(predicted, 2),
        "trend": trend,
        "trendAmount": round(abs(slope), 2),
        "confidence": confidence,
        "r2Score": round(r2, 3),
        "model": "LinearRegression (scikit-learn)",
        "message": f"Trained on {len(monthly)} months of data. Spending trend is {trend} by ₹{abs(slope):.0f}/month.",
        "monthsUsed": len(monthly)
    }

    if predictions_collection is not None:
        predictions_collection.insert_one({**result, "userId": req.userId, "type": "expense_forecast", "createdAt": datetime.utcnow().isoformat()})

    return result

# ─────────────────────────────────────────────────────────────────────────────
#  MODEL 2 — Isolation Forest: Anomaly Detection
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/ml/behavior-analysis")
def behavior_analysis(req: BehaviorAnalysisRequest):
    """
    REAL ML: Trains an IsolationForest on [amount, category_encoded] features.
    IsolationForest is an unsupervised ML model that learns normal spending
    patterns and assigns anomaly scores to outlier transactions.
    Also uses Z-score for a secondary signal.
    """
    expenses = [t for t in req.transactions if t.type == 'expense']
    if len(expenses) < 5:
        return {
            "alerts": [],
            "insights": [{"id": "info1", "type": "info", "message": "Add at least 5 expense transactions to activate Isolation Forest anomaly detection."}]
        }

    # ── Build feature matrix ─────────────────────────────────────────────────
    categories = list({t.category for t in expenses})
    cat_to_idx = {c: i for i, c in enumerate(categories)}

    records = []
    for t in expenses:
        records.append({
            "id": t.id or "",
            "amount": t.amount,
            "category": t.category,
            "cat_idx": cat_to_idx[t.category],
        })
    df = pd.DataFrame(records)

    X = df[['amount', 'cat_idx']].values

    # ── Train Isolation Forest ───────────────────────────────────────────────
    contamination = min(0.15, max(0.05, 3 / len(df)))  # adaptive contamination
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=42
    )
    df['anomaly_label'] = iso_forest.fit_predict(X)   # -1 = anomaly, 1 = normal
    df['anomaly_score'] = iso_forest.decision_function(X)  # lower = more anomalous

    anomalies = df[df['anomaly_label'] == -1].copy()

    alerts = []
    for _, row in anomalies.iterrows():
        severity = "high" if row['anomaly_score'] < -0.15 else "medium"
        alert_doc = {
            "id": f"iso_{row['id']}_{int(row['amount'])}",
            "userId": req.userId,
            "type": "warning",
            "message": (
                f"🤖 Isolation Forest Alert [{severity.upper()}]: Your ₹{row['amount']:,.0f} "
                f"expense in '{row['category']}' is flagged as anomalous by the ML model "
                f"(anomaly score: {row['anomaly_score']:.3f}). This transaction does not fit "
                f"your usual spending pattern."
            ),
            "severity": severity,
            "model": "IsolationForest",
            "createdAt": datetime.utcnow().isoformat()
        }
        alerts.append(alert_doc)
        if alerts_collection is not None:
            alerts_collection.insert_one({**alert_doc, "userId": req.userId})

    # ── Generate smart insights ──────────────────────────────────────────────
    insights = []
    total_inc = sum(t.amount for t in req.transactions if t.type == 'income')
    total_exp = sum(t.amount for t in expenses)

    if total_inc > 0:
        savings_rate = (total_inc - total_exp) / total_inc
        if savings_rate > 0.25:
            insights.append({
                "id": "sav_great",
                "type": "success",
                "message": f"✅ Excellent! Savings rate of {savings_rate*100:.1f}%. Isolation Forest found {len(anomalies)} unusual transaction(s) out of {len(expenses)} expenses."
            })
        elif savings_rate < 0.05:
            insights.append({
                "id": "sav_low",
                "type": "warning",
                "message": f"⚠️ Savings rate is critically low at {savings_rate*100:.1f}%. Consider reducing discretionary expenses."
            })

    insights.append({
        "id": "iso_summary",
        "type": "info",
        "message": f"🌲 Isolation Forest scanned {len(expenses)} expense transactions and flagged {len(anomalies)} as statistically unusual (contamination rate: {contamination*100:.0f}%)."
    })

    return {"alerts": alerts, "insights": insights, "model": "IsolationForest (scikit-learn)"}

# ─────────────────────────────────────────────────────────────────────────────
#  MODEL 3 — Gradient Boosting: Goal Achievement Probability
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/ml/goal-prediction")
def goal_prediction(req: GoalPredictionRequest):
    """
    REAL ML: Uses GradientBoostingRegressor trained on engineered financial features
    to predict goal achievement probability.
    Features: net cash flow, progress ratio, months remaining, expense ratio.
    """
    goal = req.goal
    history = req.history

    cash_in  = sum(t.amount for t in history if t.type == 'income')
    cash_out = sum(t.amount for t in history if t.type == 'expense')
    net_cash = cash_in - cash_out
    remaining = max(goal.targetAmount - goal.currentAmount, 0)

    if remaining <= 0:
        return {"status": "success", "probability": 100.0, "model": "GradientBoostingRegressor", "recommendations": ["🎉 Goal already achieved!"]}

    # ── Feature Engineering ───────────────────────────────────────────────────
    progress_ratio  = goal.currentAmount / max(goal.targetAmount, 1)
    expense_ratio   = cash_out / max(cash_in, 1) if cash_in > 0 else 1.0
    savings_rate    = max(net_cash / max(cash_in, 1), 0)

    try:
        deadline_date = datetime.strptime(goal.deadline, "%Y-%m-%d")
        months_left = max((deadline_date - datetime.utcnow()).days / 30, 0.5)
    except Exception:
        months_left = 6.0

    monthly_savings_needed = remaining / months_left if months_left > 0 else remaining
    monthly_net_savings    = net_cash / max(len(history) / 20, 1)
    feasibility_ratio      = monthly_net_savings / max(monthly_savings_needed, 1)

    features = np.array([[
        progress_ratio,
        savings_rate,
        expense_ratio,
        feasibility_ratio,
        months_left,
        net_cash / max(goal.targetAmount, 1),
    ]])

    # ── Synthetic training data (representative financial scenarios) ──────────
    # Each row: [progress, savings_rate, exp_ratio, feasibility, months, net_ratio] → probability
    X_train = np.array([
        [0.0,  0.0,  1.0,  0.0,  1,   -0.5],  [0.0,  0.05, 0.95, 0.1,  2,   0.0 ],
        [0.0,  0.10, 0.90, 0.3,  4,   0.1 ],  [0.1,  0.15, 0.85, 0.5,  6,   0.2 ],
        [0.2,  0.20, 0.80, 0.7,  8,   0.3 ],  [0.3,  0.25, 0.75, 1.0,  10,  0.4 ],
        [0.4,  0.30, 0.70, 1.2,  12,  0.5 ],  [0.5,  0.35, 0.65, 1.5,  10,  0.6 ],
        [0.6,  0.40, 0.60, 2.0,  8,   0.7 ],  [0.7,  0.45, 0.55, 2.5,  6,   0.8 ],
        [0.8,  0.50, 0.50, 3.0,  4,   0.9 ],  [0.9,  0.55, 0.45, 4.0,  3,   1.0 ],
        [1.0,  0.60, 0.40, 5.0,  2,   1.2 ],  [0.05, 0.0,  1.1,  -0.1, 1,   -0.3],
        [0.15, 0.05, 0.95, 0.2,  3,   0.05],  [0.25, 0.12, 0.88, 0.4,  5,   0.15],
        [0.45, 0.22, 0.78, 0.9,  7,   0.35],  [0.65, 0.38, 0.62, 1.8,  9,   0.65],
        [0.85, 0.48, 0.52, 3.5,  3,   0.95],  [0.95, 0.58, 0.42, 4.5,  2,   1.1 ],
    ])
    y_train = np.array([
        5,  12, 22, 33, 44, 55, 64, 71, 79, 85, 90, 94, 97, 8, 18, 30, 52, 75, 92, 96
    ], dtype=float)

    # ── Train Gradient Boosting ───────────────────────────────────────────────
    model = GradientBoostingRegressor(n_estimators=80, learning_rate=0.1, max_depth=3, random_state=42)
    model.fit(X_train, y_train)

    raw_prob = float(model.predict(features)[0])
    probability = round(min(max(raw_prob, 5.0), 98.0), 1)

    # Recommendations
    recs = []
    if savings_rate < 0.15:
        recs.append(f"📉 Increase savings rate (currently {savings_rate*100:.1f}%). Target 20%+ to hit your goal.")
    if feasibility_ratio < 1.0:
        recs.append(f"⚡ You need ₹{monthly_savings_needed:,.0f}/month but are saving ₹{monthly_net_savings:,.0f}/month. Reduce expenses by ₹{monthly_savings_needed - monthly_net_savings:,.0f}.")
    if months_left < 3 and probability < 70:
        recs.append(f"⏰ Only {months_left:.0f} month(s) left! Consider extending the deadline or adding a lump sum.")
    if probability >= 80:
        recs.append(f"🎯 Strong trajectory! At this rate you will hit your goal with {probability:.0f}% confidence.")
    if not recs:
        recs.append("Keep tracking your transactions and the ML model will refine its prediction.")

    return {
        "status": "success",
        "probability": probability,
        "model": "GradientBoostingRegressor (scikit-learn)",
        "feasibilityRatio": round(feasibility_ratio, 2),
        "monthlySavingsNeeded": round(monthly_savings_needed, 2),
        "monthsRemaining": round(months_left, 1),
        "recommendations": recs
    }

# ─────────────────────────────────────────────────────────────────────────────
#  MODEL 4 — KMeans: Spending Pattern Clustering
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/ml/spending-patterns")
def spending_patterns(req: SpendingPatternRequest):
    """
    REAL ML: Uses KMeans clustering to group your expense categories
    into behaviour clusters (e.g. "Essential", "Lifestyle", "Discretionary").
    Features per category: total_amount, transaction_count, avg_amount.
    """
    expenses = [t for t in req.transactions if t.type == 'expense']
    if len(expenses) < 6:
        return {"clusters": [], "message": "Need at least 6 expense transactions for pattern clustering.", "model": "KMeans"}

    # ── Aggregate per category ────────────────────────────────────────────────
    cat_stats: dict = {}
    for t in expenses:
        c = t.category
        if c not in cat_stats:
            cat_stats[c] = {"total": 0, "count": 0}
        cat_stats[c]["total"] += t.amount
        cat_stats[c]["count"] += 1

    rows = []
    for cat, stats in cat_stats.items():
        rows.append({
            "category": cat,
            "total_amount": stats["total"],
            "transaction_count": stats["count"],
            "avg_amount": stats["total"] / stats["count"],
        })
    df = pd.DataFrame(rows)

    if len(df) < 3:
        return {"clusters": [], "message": "Need more unique categories for clustering.", "model": "KMeans"}

    # ── Train KMeans ─────────────────────────────────────────────────────────
    n_clusters = min(3, len(df))
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('kmeans', KMeans(n_clusters=n_clusters, random_state=42, n_init=10))
    ])
    df['cluster'] = pipeline.fit_predict(df[['total_amount', 'transaction_count', 'avg_amount']])

    # ── Label clusters by total spend ────────────────────────────────────────
    cluster_totals = df.groupby('cluster')['total_amount'].sum().sort_values(ascending=False)
    cluster_labels = {}
    label_names = ["🔴 High Spend", "🟡 Moderate Spend", "🟢 Low Spend"]
    for rank, (cid, _) in enumerate(cluster_totals.items()):
        cluster_labels[cid] = label_names[rank] if rank < len(label_names) else "Other"

    clusters = []
    for cid in sorted(df['cluster'].unique()):
        group = df[df['cluster'] == cid]
        clusters.append({
            "clusterId": int(cid),
            "label": cluster_labels.get(cid, "Other"),
            "categories": group['category'].tolist(),
            "totalSpend": round(float(group['total_amount'].sum()), 2),
            "avgTransaction": round(float(group['avg_amount'].mean()), 2),
            "transactionCount": int(group['transaction_count'].sum()),
        })

    total_exp = sum(r["totalSpend"] for r in clusters)
    insight_msg = (
        f"🔬 KMeans clustered your {len(df)} spending categories into {n_clusters} groups. "
        f"Your highest-spend cluster '{clusters[0]['label']}' accounts for "
        f"₹{clusters[0]['totalSpend']:,.0f} ({clusters[0]['totalSpend']/max(total_exp,1)*100:.0f}% of total)."
    ) if clusters else "Not enough data."

    return {
        "status": "success",
        "clusters": clusters,
        "totalCategories": len(df),
        "model": "KMeans (scikit-learn)",
        "insight": insight_msg
    }

# ─────────────────────────────────────────────────────────────────────────────
#  MODEL 5 — Ridge Regression: Smart Budget Recommendations
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/ml/budget-recommendation")
def budget_recommendation(req: BudgetRecommendationRequest):
    """
    REAL ML: Trains a Ridge regression on per-category spending history
    to recommend an optimal monthly budget for each category,
    combining the 50/30/20 rule with ML-learned personal patterns.
    """
    expenses = [t for t in req.transactions if t.type == 'expense']
    incomes  = [t for t in req.transactions if t.type == 'income']

    if not incomes or len(expenses) < 5:
        return {"recommendations": [], "message": "Need income + 5 expense transactions for budget modelling.", "model": "Ridge"}

    total_income = sum(t.amount for t in incomes)
    total_expense = sum(t.amount for t in expenses)

    # ── Category monthly aggregates ───────────────────────────────────────────
    df = pd.DataFrame([{"amount": t.amount, "category": t.category, "date": pd.to_datetime(t.date)} for t in expenses])
    df['month'] = df['date'].dt.to_period('M')
    num_months = df['month'].nunique()

    cat_monthly = (
        df.groupby(['category', 'month'])['amount']
        .sum()
        .reset_index()
    )

    recommendations = []

    for cat in df['category'].unique():
        cat_data = cat_monthly[cat_monthly['category'] == cat].copy()
        cat_data = cat_data.sort_values('month')
        cat_data['month_idx'] = range(1, len(cat_data) + 1)

        if len(cat_data) < 2:
            avg = float(cat_data['amount'].mean())
            recommendations.append({
                "category": cat,
                "currentAvgMonthly": round(avg, 2),
                "recommendedBudget": round(avg * 0.90, 2),
                "potentialSaving": round(avg * 0.10, 2),
                "model": "Ridge (insufficient history — avg fallback)",
                "confidence": "low"
            })
            continue

        # ── Train Ridge Regression per category ──────────────────────────────
        X = cat_data[['month_idx']].values
        y = cat_data['amount'].values
        ridge = Ridge(alpha=1.0)
        ridge.fit(X, y)

        next_idx = len(cat_data) + 1
        predicted_next = float(ridge.predict([[next_idx]])[0])
        predicted_next = max(predicted_next, 0)

        # 50/30/20 guardrail: cap any single category at 25% of income
        cap = total_income * 0.25 / max(num_months, 1)
        recommended = min(predicted_next * 0.88, cap)  # 12% trim + cap

        current_avg = float(cat_data['amount'].mean())
        saving = max(current_avg - recommended, 0)

        r2 = ridge.score(X, y)
        confidence = "high" if r2 > 0.65 else "medium" if r2 > 0.35 else "low"

        recommendations.append({
            "category": cat,
            "currentAvgMonthly": round(current_avg, 2),
            "predictedNextMonth": round(predicted_next, 2),
            "recommendedBudget": round(recommended, 2),
            "potentialSaving": round(saving, 2),
            "r2Score": round(r2, 3),
            "model": "Ridge Regression (scikit-learn)",
            "confidence": confidence
        })

    recommendations.sort(key=lambda r: r['potentialSaving'], reverse=True)

    total_potential_saving = sum(r['potentialSaving'] for r in recommendations)
    summary = (
        f"📊 Ridge Regression analysed {len(recommendations)} spending categories. "
        f"By following these recommendations you could save ₹{total_potential_saving:,.0f} next month."
    )

    return {
        "status": "success",
        "recommendations": recommendations,
        "totalPotentialSaving": round(total_potential_saving, 2),
        "model": "Ridge Regression (scikit-learn)",
        "summary": summary
    }
