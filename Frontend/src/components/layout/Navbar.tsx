import { Menu } from 'lucide-react'
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

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium leading-none">{user?.name || 'User'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
