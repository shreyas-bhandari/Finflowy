import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      })
      toast.success('Account created successfully!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>

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
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start your journey to financial intelligence</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="John Doe" 
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
