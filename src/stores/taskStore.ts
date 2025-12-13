import { defineStore } from 'pinia'
import apiClient from '../services/api'
import type { Task, Category, CreateTaskPayload } from '../types'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,
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
        const { data } = await apiClient.get<Task[]>('/tasks?order=created_at.desc')
        this.tasks = data
      } catch (err) {
        this.error = 'Failed to load tasks'
        console.error(err)
      } finally {
        this.isLoading = false
      }
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
