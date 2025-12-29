import { defineStore } from 'pinia'
import apiClient from '../services/api'
import type { Task, Category, CreateTaskPayload } from '../types'

interface TaskFilters {
  category: number | null
  status: boolean | null
  priority: string | null
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,

    currentPage: 1,
    itemsPerPage: 6,
    hasMoreTasks: true,

    filters: {
      category: null as number | null,
      status: null as boolean | null,
      priority: null as string | null,
    },
  }),

  actions: {
    async fetchCategories() {
      try {
        const { data } = await apiClient.get<Category[]>('/categories?order=name.asc')
        this.categories = data
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        this.error = 'Failed to load categories'
      }
    },

    async fetchTasks() {
      this.isLoading = true
      this.error = null

      try {
        const offset = (this.currentPage - 1) * this.itemsPerPage

        let query = `/tasks?order=created_at.desc&limit=${this.itemsPerPage}&offset=${offset}`

        //  filters
        // by category

        if (this.filters.category !== null) {
          query += `&category_id=eq.${this.filters.category}`
        }

        // by status
        if (this.filters.status !== null) {
          query += `&completed=eq.${this.filters.status}`
        }
        // by priority
        if (this.filters.priority !== null) {
          query += `&priority=eq.${this.filters.priority}`
        }
        const { data } = await apiClient.get<Task[]>(query)

        this.tasks = data
        this.hasMoreTasks = data.length === this.itemsPerPage
      } catch (err: unknown) {
        this.error = 'Failed to load tasks'
        if (err instanceof Error) {
          console.error('Error fetching tasks', err.message)
        }
      } finally {
        this.isLoading = false
      }
    },

    updateFilter<K extends keyof TaskFilters>(type: K, value: TaskFilters[K]) {
      if (this.filters[type] === value) {
        this.filters[type] = null as TaskFilters[K]
      } else {
        this.filters[type] = value
      }

      this.currentPage = 1
      this.fetchTasks()
    },

    clearAllFilters() {
      this.filters = {
        category: null,
        status: null,
        priority: null,
      }
      this.currentPage = 1
      this.fetchTasks()
    },

    changePage(newPage: number) {
      if (newPage < 1) return
      this.currentPage = newPage
      this.fetchTasks()
    },

    async addTask(payload: CreateTaskPayload) {
      try {
        const { data } = await apiClient.post<Task[]>('/tasks', payload)
        if (data && data[0]) {
          this.tasks.unshift(data[0])
          if (this.tasks.length > this.itemsPerPage) {
            this.tasks.pop()
          }
        }
      } catch (err) {
        console.error('Failed to create task:', err)
        throw err
      }
    },

    async updateTask(id: number, payload: Partial<CreateTaskPayload> & { completed?: boolean }) {
      try {
        const { data } = await apiClient.patch<Task[]>(`/tasks?id=eq.${id}`, payload)
        if (data && data[0]) {
          const index = this.tasks.findIndex((t) => t.id === id)
          if (index !== -1) {
            this.tasks[index] = data[0]
          }
        }
      } catch (err) {
        console.error('Failed to update task:', err)
        throw err
      }
    },

    async deleteTask(id: number) {
      try {
        await apiClient.delete(`/tasks?id=eq.${id}`)
        this.tasks = this.tasks.filter((t) => t.id !== id)
        if (this.tasks.length === 0 && this.currentPage > 1) {
          this.changePage(this.currentPage - 1)
        } else {
          this.fetchTasks()
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
        throw err
      }
    },
  },
})
