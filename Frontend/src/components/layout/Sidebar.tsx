import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const navItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', name: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', name: 'Insights', icon: PieChart },
  { path: '/goals', name: 'Goals', icon: Target },
  { path: '/profile', name: 'Profile', icon: User },
]

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const logout = useAuthStore(state => state.logout)

  return (
    <aside
      className={cn(
        "fixed md:relative z-40 h-screen transition-all duration-300 ease-in-out bg-card/50 backdrop-blur-xl border-r border-white/10 flex flex-col",
        isOpen ? "w-64" : "w-0 md:w-20 -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <div className={cn("font-bold text-xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent truncate", !isOpen && "md:hidden")}>
          FinFlowy
        </div>
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10 hidden md:block">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/20 text-primary self-shadow" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )
            }
          >
            <item.icon size={22} className="min-w-[22px]" />
            <span className={cn("font-medium transition-opacity duration-200 whitespace-nowrap", !isOpen && "md:opacity-0 md:-space-x-10")}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className={cn(
            "flex items-center space-x-3 px-3 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors",
          )}
        >
          <LogOut size={22} className="min-w-[22px]" />
          <span className={cn("font-medium transition-opacity", !isOpen && "md:opacity-0")}>Logout</span>
        </button>
      </div>
    </aside>
  )
}
