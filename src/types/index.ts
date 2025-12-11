export type TaskPriority = 'low' | 'medium' | 'high'
export type ImageFilter = 'default' | 'grayscale' | 'sepia' | 'blur'

export interface Category {
  id: number
  name: string
  color: string
  icon_url: string
  image_filter: ImageFilter
  image_seed_offset: number
  created_at: string
}

export interface Task {
  id: number
  created_at: string
  updated_at?: string
  title: string
  description: string | null
  priority: TaskPriority
  category_id: number
  due_date: string | null
  completed: boolean
  image_url: string | null
}

export interface CreateTaskPayload {
  title: string
  category_id: number
  description?: string
  priority?: TaskPriority
  due_date?: string
  image_url?: string
}
