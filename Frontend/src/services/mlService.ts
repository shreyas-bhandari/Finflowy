import api from './api'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ExpenseForecast {
  predictedExpense: number
  trend: string
  trendAmount: number
  confidence: string
  r2Score: number
  model: string
  message: string
  monthsUsed: number
}

export interface SpendingCluster {
  clusterId: number
  label: string
  categories: string[]
  totalSpend: number
  avgTransaction: number
  transactionCount: number
}

export interface SpendingPatterns {
  clusters: SpendingCluster[]
  totalCategories: number
  model: string
  insight: string
}

export interface BudgetRec {
  category: string
  currentAvgMonthly: number
  predictedNextMonth: number
  recommendedBudget: number
  potentialSaving: number
  r2Score: number
  model: string
  confidence: string
}

export interface BudgetRecommendation {
  recommendations: BudgetRec[]
  totalPotentialSaving: number
  model: string
  summary: string
}

// ── API calls ─────────────────────────────────────────────────────────────────
export const fetchExpenseForecast = (): Promise<ExpenseForecast> =>
  api.get('/finance/insights/forecast').then(r => r.data)

export const fetchSpendingPatterns = (): Promise<SpendingPatterns> =>
  api.get('/finance/insights/spending-patterns').then(r => r.data)

export const fetchBudgetRecommendations = (): Promise<BudgetRecommendation> =>
  api.get('/finance/insights/budget-recommendation').then(r => r.data)
