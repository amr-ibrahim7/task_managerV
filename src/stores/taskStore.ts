import { defineStore } from 'pinia'
import apiClient from '../services/api'
import type { Task, Category, CreateTaskPayload } from '../types'

type FilterType = 'all' | 'category' | 'status' | 'priority'
type FilterValue = number | boolean | string | null

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,

    currentPage: 1,
    itemsPerPage: 6,
    hasMoreTasks: true,

    currentFilter: {
      type: 'all' as FilterType,
      value: null as FilterValue,
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

        if (this.currentFilter.type === 'category') {
          query += `&category_id=eq.${this.currentFilter.value}`
        } else if (this.currentFilter.type === 'status') {
          query += `&completed=eq.${this.currentFilter.value}`
        } else if (this.currentFilter.type === 'priority') {
          query += `&priority=eq.${this.currentFilter.value}`
        }

        const { data } = await apiClient.get<Task[]>(query)

        this.tasks = data

        this.hasMoreTasks = data.length === this.itemsPerPage
      } catch (err: unknown) {
        this.error = 'Failed to load tasks'

        if (err instanceof Error) {
          console.error(err.message)
        } else {
          console.error('An unknown error occurred', err)
        }
      } finally {
        this.isLoading = false
      }
    },

    setFilter(type: FilterType, value: FilterValue = null) {
      this.currentFilter = { type, value }
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
      } catch (err) {
        console.error('Failed to delete task:', err)
        throw err
      }
    },
  },
})
