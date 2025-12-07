'use client'

import { Task } from '@/types'
import { format } from 'date-fns'
import { Calendar, Edit2, Trash2, Check } from 'lucide-react'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

const priorityBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      setIsDeleting(true)
      await onDelete(task._id)
      setIsDeleting(false)
    }
  }

  const handleStatusClick = () => {
    const statusOrder = ['To Do', 'In Progress', 'Done']
    const currentIndex = statusOrder.indexOf(task.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    onStatusChange(task._id, nextStatus)
  }

  return (
    <div
      className={`card card-hover p-5 transition-all duration-200 ${
        task.status === 'Done' ? 'opacity-60' : ''
      } ${isDeleting ? 'opacity-30 pointer-events-none scale-[0.98]' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={handleStatusClick}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
            task.status === 'Done'
              ? 'bg-[rgb(var(--foreground))] border-[rgb(var(--foreground))]'
              : task.status === 'In Progress'
              ? 'border-[rgb(var(--foreground))] bg-[rgba(var(--foreground),0.08)]'
              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--muted))]'
          }`}
          title={`Status: ${task.status}. Click to change.`}
        >
          {task.status === 'Done' && (
            <Check className="w-3 h-3 text-[rgb(var(--background))]" strokeWidth={3} />
          )}
          {task.status === 'In Progress' && (
            <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--foreground))]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-[0.95rem] leading-snug ${
              task.status === 'Done' ? 'line-through text-[rgb(var(--muted))]' : ''
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-[rgb(var(--muted))] mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
        <div className="flex items-center gap-2">
          <span className={`badge ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
          <span className="badge badge-neutral">
            {task.status}
          </span>
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              isOverdue ? 'text-red-500' : 'text-[rgb(var(--muted))]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>

      <div 
        className={`flex items-center gap-2 mt-4 transition-all duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => onEdit(task)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-[rgb(var(--border))] hover:border-[rgb(var(--muted))] hover:bg-[rgb(var(--subtle))] transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
