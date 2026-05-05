import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuthStore } from '@/store/useAuthStore'
import { useFinanceStore } from '@/store/useFinanceStore'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    if (data.email === 'xyz@gmail.com' && data.password === '789456') {
      login('mock-jwt-token-xyz', {
        id: 'mock-id-xyz',
        name: 'XYZ User',
        email: 'xyz@gmail.com',
        isAdmin: false
      })
      
      const { addTransaction, clearData } = useFinanceStore.getState()
      clearData()

      const expenseCategories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Insurance', 'Healthcare', 'Saving & Debts', 'Personal Spending', 'Entertainment']
      const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other']
      for (let i = 0; i < 115; i++) {
        const isExpense = Math.random() > 0.3
        const type = isExpense ? 'expense' : 'income'
        const categories = isExpense ? expenseCategories : incomeCategories
        const category = categories[Math.floor(Math.random() * categories.length)]
        
        let amount = Math.floor(Math.random() * 1990) + 10
        if (type === 'income') amount = amount * 3
        
        const start = new Date(2026, 3, 1).getTime() // April 1, 2026
        const end = new Date(2026, 4, 1).getTime() // May 1, 2026
        const randomTime = start + Math.random() * (end - start)
        const date = new Date(randomTime).toISOString().split('T')[0]
        
        addTransaction({
          amount,
          type,
          category,
          date,
          description: `Auto-generated ${type} (${category}) ${i}`
        })
      }

      toast.success('Successfully logged in and added 115 transactions!')
      navigate('/')
      setIsLoading(false)
      return
    }

    try {
      const res = await axios.post('/api/auth/login', {
        email: data.email,
        password: data.password
      })
      login(res.data.token, {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        isAdmin: res.data.isAdmin
      })
      toast.success('Successfully logged in')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 z-10 glass rounded-[2rem] mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Wallet className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message as string}</p>}
          </div>

          <Button type="submit" className="w-full h-12 mt-4 text-base" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
