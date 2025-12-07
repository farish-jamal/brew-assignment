'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Task } from '@/types'
import api from '@/lib/api'
import { getAuth, clearAuth } from '@/lib/auth'
import { useTheme } from '../providers'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import StatsCard from '@/components/StatsCard'
import {
  Plus,
  LogOut,
  Moon,
  Sun,
  Search,
  Inbox,
  ArrowUpDown,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  total: number
  todo: number
  inProgress: number
  done: number
  highPriority: number
  overdue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const auth = getAuth()
    if (!auth?.user) {
      router.push('/login')
      return
    }
    setUser(auth.user)
  }, [])

  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    highPriority: 0,
    overdue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/tasks?${params.toString()}`),
        api.get('/tasks/stats'),
      ])

      setTasks(tasksRes.data)
      setStats(statsRes.data)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [user, searchQuery, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleSubmitTask = async (formData: any) => {
    setIsSubmitting(true)
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData)
        toast.success('Task updated successfully!')
      } else {
        await api.post('/tasks', formData)
        toast.success('Task created successfully!')
      }
      setShowForm(false)
      setEditingTask(null)
      await fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted successfully!')
      await fetchData()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/tasks/${id}`, { status })
      toast.success('Task status updated!')
      await fetchData()
    } catch {
      toast.error('Failed to update task status')
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop border-b border-[rgb(var(--border))]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[rgb(var(--foreground))] flex items-center justify-center">
                <span className="text-[rgb(var(--background))] font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
                <p className="text-sm text-[rgb(var(--muted))]">
                  Hello, {user.name?.split(' ')[0]} 👋
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="btn-icon"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="btn-icon group"
                aria-label="Logout"
              >
                <LogOut className="w-[18px] h-[18px] group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="animate-slide-up">
          <StatsCard stats={stats} />
        </div>

        <div 
          className="card p-4 my-8 animate-slide-up" 
          style={{ animationDelay: '0.06s' }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgb(var(--muted))] group-focus-within:text-[rgb(var(--foreground))] transition-colors pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="input-field input-with-icon"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[rgb(var(--muted))]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select-field"
                >
                  <option value="all">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[rgb(var(--muted))]" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by)
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="select-field"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="createdAt-asc">Oldest</option>
                  <option value="priority-desc">Priority</option>
                  <option value="dueDate-asc">Due Date</option>
                </select>
              </div>

              <button onClick={handleCreateTask} className="btn-primary ml-auto">
                <Plus className="w-[18px] h-[18px]" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="card p-5 animate-slide-up"
                style={{ animationDelay: `${(i + 2) * 0.04}s` }}
              >
                <div className="skeleton h-5 w-2/3 mb-4" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-3/4 mb-5" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-14 rounded-md" />
                  <div className="skeleton h-6 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div 
            className="card p-16 text-center animate-scale-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[rgb(var(--subtle))] border border-[rgb(var(--border))] flex items-center justify-center">
              <Inbox className="w-7 h-7 text-[rgb(var(--muted))]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-[rgb(var(--muted))] mb-6 max-w-xs mx-auto">
              Start organizing your work by creating your first task
            </p>
            <button onClick={handleCreateTask} className="btn-primary">
              <Plus className="w-[18px] h-[18px]" />
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task, index) => (
              <div
                key={task._id}
                className="animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 0.04}s` }}
              >
                <TaskCard
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <TaskForm
          task={editingTask}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitTask}
          onClose={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
