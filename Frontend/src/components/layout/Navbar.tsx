import { Menu, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

interface NavbarProps {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const user = useAuthStore(state => state.user)

  return (
    <header className="h-16 border-b border-white/10 bg-background/50 backdrop-blur-lg sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground">
          <Menu size={24} />
        </button>
        <span className="font-semibold text-lg md:hidden">FinFlowy</span>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background"></span>
        </button>

        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-muted-foreground text-xs mt-1">Premium Member</p>
          </div>
        </div>
      </div>
    </header>
  )
}
