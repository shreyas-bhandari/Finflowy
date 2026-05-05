import { useMemo } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useFinanceStore } from '@/store/useFinanceStore'
import { TrendingUp, TrendingDown, Wallet, Sparkles, IndianRupee } from 'lucide-react'

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#facc15', '#22d3ee']

const formatINR = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-xl border border-white/10 text-sm shadow-2xl">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {formatINR(entry.value)}
          </p>
        ))}
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

    const computedPieData = Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key]
    }))

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
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Main Line Chart */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
            <CardDescription>Income vs Expenses over time (in ₹)</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData.length ? lineData : [{ name: 'No data', income: 0, expense: 0 }]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: '#ec4899' }} />
                <Legend formatter={(val) => <span style={{ color: '#aaa', fontSize: 12, textTransform: 'capitalize' }}>{val}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Visual breakdown of your expenses</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                      contentStyle={{ background: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2 w-full px-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-medium text-muted-foreground truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Sparkles className="opacity-40" size={36} />
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
                    <p className="font-semibold text-sm">{tx.description}</p>
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
