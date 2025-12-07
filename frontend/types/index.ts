export interface Task {
  _id: string
  title: string
  description: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  status: 'To Do' | 'In Progress' | 'Done'
  user: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

