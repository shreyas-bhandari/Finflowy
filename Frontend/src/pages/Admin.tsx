import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Users } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface UserData {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt: string
}

export default function Admin() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      toast.error('Not authorized as admin')
      navigate('/')
      return
    }

    fetchUsers()
  }, [isAuthenticated, user, navigate])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('User deleted')
        fetchUsers()
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-semibold">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 rounded-lg">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-4 font-medium">{u.name}</td>
                  <td className="px-4 py-4">{u.email}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isAdmin ? 'bg-purple-500/20 text-purple-500' : 'bg-primary/20 text-primary'}`}>
                      {u.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {!u.isAdmin && (
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
