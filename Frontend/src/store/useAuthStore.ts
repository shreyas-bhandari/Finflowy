import { create } from 'zustand'
import { useFinanceStore } from './useFinanceStore'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken ? storedToken : null,
  isAuthenticated: !!storedToken,
  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    useFinanceStore.getState().clearData()
    set({ token: null, user: null, isAuthenticated: false })
  },
  updateUser: (data) => set((state) => {
    if (!state.user) return { user: null }
    const updatedUser = { ...state.user, ...data }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return { user: updatedUser }
  })
}))
