from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np

app = FastAPI(title="FinFlowy AI Microservice", version="1.0.0")

# --- Pydantic Models ---

class Transaction(BaseModel):
    id: Optional[str] = None
    amount: float
    type: str # 'income' or 'expense'
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

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "finance-ml-service"}

@app.post("/api/ml/predict-expense")
def predict_expense(req: PredictExpenseRequest):
    """
    Very lightweight predictive model for next month's absolute functional expenses.
    Using Pandas dataframe aggregations and standard mean to project trajectory.
    """
    if not req.transactions:
        return {"predictedExpense": 0, "message": "Insufficient data"}
    
    # Filter expenses
    expenses = [t for t in req.transactions if t.type == 'expense']
    if not expenses:
        return {"predictedExpense": 0, "message": "No expenses to predict"}
        
    df = pd.DataFrame([{ "amount": t.amount, "date": pd.to_datetime(t.date) } for t in expenses])
    df['month'] = df['date'].dt.to_period('M')
    monthly_totals = df.groupby('month')['amount'].sum()
    
    if len(monthly_totals) < 2:
        predicted = float(monthly_totals.mean()) * 1.05 # Add 5% fuzzy variance for single month
    else:
        # Simple moving average to project next month
        predicted = float(monthly_totals.tail(3).mean())
        
    return {
        "status": "success",
        "predictedExpense": round(predicted, 2),
        "message": "Calculated via SMA of recent activity"
    }

@app.post("/api/ml/behavior-analysis")
def behavior_analysis(req: BehaviorAnalysisRequest):
    """
    Uses Standard Deviation (Z-score concept) over transactions
    to detect immediate high-spending anomalies.
    """
    if not req.transactions:
        return {"alerts": [], "insights": []}

    expenses = [t for t in req.transactions if t.type == 'expense']
    if len(expenses) < 3:
        return {"alerts": [], "insights": [{"id": "info1", "type": "info", "message": "Add more transactions for behavioral analysis."}]}

    df = pd.DataFrame([{ "id": getattr(t, 'id', str(i)), "amount": t.amount, "category": t.category } for i, t in enumerate(expenses)])
    
    mean_val = df['amount'].mean()
    std_dev = df['amount'].std()
    
    # Identify anomalies (amounts > Mean + 1.5 * StdDev) - threshold lowered for demo purposes
    anomalies = df[df['amount'] > (mean_val + 1.5 * std_dev)]
    alerts = []
    
    for _, row in anomalies.iterrows():
        alerts.append({
            "id": f"warn_{row['id']}",
            "type": "warning", 
            "message": f"Anomaly Detected: Your ${row['amount']:.2f} expense in {row['category']} is statistically unusual."
        })
        
    # Generate generic insights based on cashflow
    incomes = sum(t.amount for t in req.transactions if t.type == 'income')
    total_exp = sum(t.amount for t in expenses)
    insights = []
    
    if incomes > 0:
        savings_rate = (incomes - total_exp) / incomes
        if savings_rate > 0.2:
            insights.append({"id": "success1", "type": "success", "message": f"Excellent! Your calculated savings rate is {savings_rate*100:.1f}%. You are maintaining great discipline."})

    return {"alerts": alerts, "insights": insights}

@app.post("/api/ml/goal-prediction")
def goal_prediction(req: GoalPredictionRequest):
    """
    Projects how likely a user is to hit their goal targetAmount.
    """
    goal = req.goal
    cash_flow_in = sum(t.amount for t in req.history if t.type == 'income')
    cash_flow_out = sum(t.amount for t in req.history if t.type == 'expense')
    net_free_cash = cash_flow_in - cash_flow_out
    
    remaining_balance = goal.targetAmount - goal.currentAmount
    if remaining_balance <= 0:
        return {"status": "success", "probability": 100, "recommendations": ["Goal Completed!"]}
        
    if net_free_cash <= 0:
        return {"status": "warning", "probability": 10, "recommendations": ["Negative cash flow detected. Reduce expenses to save."]}
        
    # Arbitrary mathematical likelihood simulation based on Net Cash
    # If Net Cash is greater than half the remaining balance, highly likely to hit it
    probability_ratio = min((net_free_cash / (remaining_balance + 0.1)) * 100, 95)
    
    # Adjust for baseline minimum trajectory
    final_prob = max(probability_ratio, 25.0)
    
    return {
        "status": "success", 
        "probability": round(final_prob, 1), 
        "recommendations": ["Consider allocating a fixed percentage of income automatically."]
    }
