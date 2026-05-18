import { useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useFinanceStore } from '@/store/useFinanceStore'
import { TrendingUp, TrendingDown, Wallet, Sparkles, IndianRupee } from 'lucide-react'

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#facc15', '#22d3ee']

const formatINR = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const formatINRShort = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

// Custom tooltip for area / line chart
const CashFlowTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(10,10,25,0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        <p style={{ color: '#aaa', fontSize: 11, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, fontSize: 13, margin: '3px 0', fontWeight: 600 }}>
            {entry.name === 'income' ? '↑ Income' : '↓ Expense'}: {formatINR(entry.value)}
          </p>
        ))}
        {payload.length === 2 && (
          <p style={{ color: '#888', fontSize: 11, marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
            Net: {formatINR(payload[0].value - payload[1].value)}
          </p>
        )}
      </div>
    )
  }
  return null
}

// Custom tooltip for bar chart
const CategoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(10,10,25,0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        <p style={{ color: '#ddd', fontSize: 13, fontWeight: 700 }}>{payload[0]?.payload?.name}</p>
        <p style={{ color: '#8b5cf6', fontSize: 13, marginTop: 4 }}>
          Spent: {formatINR(payload[0]?.value)}
        </p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const transactions = useFinanceStore(state => state.transactions)

  const recentTransactions = transactions.slice(0, 5)

  const { totalIncome, totalExpense, balance, savingsRate, pieData, lineData } = useMemo(() => {
    let inc = 0
    let exp = 0
    const catMap: Record<string, number> = {}
    const monthMap: Record<string, { name: string; income: number; expense: number }> = {}

    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount
      else exp += t.amount

      if (t.type === 'expense') {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount
      }

      const monthStr = t.date.substring(0, 7)
      if (!monthMap[monthStr]) {
        const dateObj = new Date(t.date)
        const monthName = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' })
        monthMap[monthStr] = { name: monthName, income: 0, expense: 0 }
      }
      if (t.type === 'income') monthMap[monthStr].income += t.amount
      else monthMap[monthStr].expense += t.amount
    })

    const computedPieData = Object.keys(catMap)
      .map(key => ({ name: key, value: catMap[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    const computedLineData = Object.keys(monthMap).sort().map(key => monthMap[key])
    const computedSavings = inc > 0 ? ((inc - exp) / inc) * 100 : 0

    return { 
      totalIncome: inc, 
      totalExpense: exp, 
      balance: inc - exp, 
      savingsRate: computedSavings,
      pieData: computedPieData,
      lineData: computedLineData
    }
  }, [transactions])

  const statsCards = [
    { 
      title: "Total Balance", 
      amount: formatINR(balance), 
      icon: Wallet, 
      positive: balance >= 0,
      sub: balance >= 0 ? 'Positive cash flow' : 'Deficit detected'
    },
    { 
      title: "Total Income", 
      amount: formatINR(totalIncome), 
      icon: TrendingUp, 
      positive: true,
      sub: `${transactions.filter(t => t.type === 'income').length} income entries`
    },
    { 
      title: "Total Expense", 
      amount: formatINR(totalExpense), 
      icon: TrendingDown, 
      positive: false,
      sub: `${transactions.filter(t => t.type === 'expense').length} expense entries`
    },
    { 
      title: "Savings Rate", 
      amount: `${savingsRate.toFixed(1)}%`, 
      icon: IndianRupee, 
      positive: savingsRate > 0,
      sub: savingsRate >= 20 ? 'Excellent discipline!' : savingsRate > 0 ? 'Room to improve' : 'No savings yet'
    }
  ]

  const noData = transactions.length === 0

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back — here is your real-time financial summary.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="hover:scale-[1.02] transition-transform duration-300 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.amount}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.positive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Sparkles size={14} className="text-primary mr-1" />
                <span className="text-muted-foreground ml-1">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Area Chart — Cash Flow */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
            <CardDescription>Monthly income vs expenses trend</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] pt-0">
            {noData ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Sparkles className="opacity-30" size={36} />
                <p className="text-sm">Add transactions to see your cash flow chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#888' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={formatINRShort}
                    tick={{ fill: '#888' }}
                    width={55}
                  />
                  <RechartsTooltip content={<CashFlowTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 12 }}
                    formatter={(val) => (
                      <span style={{ color: val === 'income' ? '#8b5cf6' : '#ec4899', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {val === 'income' ? '▲ Income' : '▼ Expense'}
                      </span>
                    )}
                  />
                  <Area type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart — Spending by Category */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Top expense categories</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] pt-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={pieData} 
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis 
                    type="number"
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatINRShort}
                    tick={{ fill: '#888' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#ccc' }}
                    width={72}
                  />
                  <RechartsTooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Sparkles className="opacity-30" size={36} />
                <p className="text-sm">No expense data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your 5 most recent financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-full ${tx.type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tx.description || tx.category}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {tx.type === 'income' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Sparkles className="mx-auto mb-2 opacity-40" size={28} />
                No transactions found. Add some from the Transactions tab!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
