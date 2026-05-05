import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { User, Shield, Bell, LogOut, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser({ name, email })
    toast.success('Profile updated successfully!')
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="space-y-6">
          <Card className="glass overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-primary/40 to-purple-500/40" />
            <CardContent className="px-6 pb-6 pt-16 flex flex-col items-center text-center relative">
              {/* Perfectly centered absolutely positioned avatar bridging the gap */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-xl overflow-hidden z-10 text-foreground">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-muted-foreground" />
                )}
              </div>
              <div className="w-full">
                <h2 className="text-xl font-bold text-foreground break-words">{user?.name}</h2>
                <p className="text-sm text-muted-foreground break-words">{user?.email}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-semibold">
                  <CheckCircle2 size={14} /> Account Verified
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
             <CardContent className="p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Update your basic profile details.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter your name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                  />
                </div>
                <Button type="submit" className="mt-2">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button variant="outline" className="mt-2 bg-white/5 border-white/10 hover:bg-white/10">
                  Update Password
                </Button>
            </CardContent>
          </Card>

          <Card className="glass">
             <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>Set your financial tracking boundaries.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                 <div>
                   <p className="font-semibold text-sm">AI Overspending Alerts</p>
                   <p className="text-xs text-muted-foreground">Receive warnings if ML logic detects an anomaly.</p>
                 </div>
                 <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                 </div>
               </div>
               
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                 <div>
                   <p className="font-semibold text-sm">Weekly Report Emails</p>
                   <p className="text-xs text-muted-foreground">Get a summarized breakdown of your finances.</p>
                 </div>
                 <div className="w-10 h-6 bg-white/20 rounded-full relative cursor-pointer">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground rounded-full" />
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
