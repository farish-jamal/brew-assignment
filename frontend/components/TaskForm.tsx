'use client'

import { Task } from '@/types'
import { X, Plus, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TaskFormProps {
  task?: Task | null
  onClose: () => void
  onSubmit: (data: FormData) => void
  isSubmitting?: boolean
}

export default function TaskForm({
  task,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'To Do' as 'To Do' | 'In Progress' | 'Done',
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        priority: task.priority,
        status: task.status,
      })
    }
  }, [task])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onSubmit(formData)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
  ]

  return (
    <div
      className="fixed inset-0 bg-[rgba(var(--background),0.8)] backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="card w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--foreground))] flex items-center justify-center">
              {task ? (
                <Pencil className="w-5 h-5 text-[rgb(var(--background))]" />
              ) : (
                <Plus className="w-5 h-5 text-[rgb(var(--background))]" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <p className="text-sm text-[rgb(var(--muted))]">
                {task ? 'Update task details' : 'Add a new task'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Add more details..."
            />
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-sm font-medium mb-2">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      priority: option.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className={`py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-all duration-150 flex items-center justify-center gap-2 ${
                    formData.priority === option.value
                      ? 'bg-[rgb(var(--foreground))] text-[rgb(var(--background))] border-[rgb(var(--foreground))]'
                      : 'border-[rgb(var(--border))] hover:border-[rgb(var(--muted))]'
                  }`}
                >
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      formData.priority === option.value ? 'bg-[rgb(var(--background))]' : option.color
                    }`} 
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="task-status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="task-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'To Do' | 'In Progress' | 'Done',
                })
              }
              className="input-field"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="btn-primary flex-1 justify-center"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[rgb(var(--background))]/30 border-t-[rgb(var(--background))] rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
