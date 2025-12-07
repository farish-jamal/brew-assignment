'use client'

import { TrendingUp, Clock, Zap, CheckCircle, AlertTriangle, Timer } from 'lucide-react'

interface Stats {
  total: number
  todo: number
  inProgress: number
  done: number
  highPriority: number
  overdue: number
}

interface StatsCardProps {
  stats: Stats
}

export default function StatsCard({ stats }: StatsCardProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const statItems = [
    { 
      label: 'Total', 
      value: stats.total,
      icon: TrendingUp,
    },
    { 
      label: 'To Do', 
      value: stats.todo,
      icon: Clock,
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress,
      icon: Zap,
    },
    { 
      label: 'Completed', 
      value: stats.done, 
      icon: CheckCircle,
      extra: completionRate > 0 ? `${completionRate}%` : null,
    },
    { 
      label: 'High Priority', 
      value: stats.highPriority,
      icon: AlertTriangle,
    },
    { 
      label: 'Overdue', 
      value: stats.overdue, 
      icon: Timer,
      alert: stats.overdue > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className={`stat-card stagger-${index + 1} animate-slide-up ${
              item.alert ? 'border-red-200 dark:border-red-900/50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[rgb(var(--subtle))] border border-[rgb(var(--border))] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[rgb(var(--muted))]" />
              </div>
              {item.extra && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-md">
                  {item.extra}
                </span>
              )}
              {item.alert && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="text-2xl font-bold tracking-tight mb-0.5">{item.value}</div>
            <div className="text-xs font-medium text-[rgb(var(--muted))] uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
