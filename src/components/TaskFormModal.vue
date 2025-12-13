<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task, Category, CreateTaskPayload } from '../types'

interface Props {
  isOpen: boolean
  task?: Task | null
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', task: CreateTaskPayload & { id?: number; completed?: boolean }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref<CreateTaskPayload & { completed: boolean }>({
  title: '',
  description: '',
  category_id: 0,
  priority: 'medium',
  due_date: '',
  image_url: '',
  completed: false,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const isEditMode = computed(() => !!props.task?.id)
const modalTitle = computed(() => (isEditMode.value ? 'Edit Task' : 'Add New Task'))

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    category_id: 0,
    priority: 'medium',
    due_date: '',
    completed: false,
  }
  errors.value = {}
}

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      formData.value = {
        title: newTask.title,
        description: newTask.description ?? '',
        category_id: newTask.category_id,
        priority: newTask.priority,
        due_date: newTask.due_date ?? '',
        completed: newTask.completed,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required'
  } else if (formData.value.title.length > 255) {
    errors.value.title = 'Title must be less than 255 characters'
  }

  if (!formData.value.category_id || formData.value.category_id === 0) {
    errors.value.category_id = 'Category is required'
  }

  if (formData.value.due_date) {
    const selectedDate = new Date(formData.value.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.value.due_date = 'Due date cannot be in the past'
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  const taskPayload = {
    title: formData.value.title,
    category_id: formData.value.category_id,
    description: formData.value.description || undefined,
    priority: formData.value.priority,
    due_date: formData.value.due_date || undefined,
    image_url: formData.value.image_url || undefined,
  }

  try {
    if (isEditMode.value) {
      await emit('save', { ...taskPayload, completed: formData.value.completed })
    } else {
      await emit('save', taskPayload)
    }
  } catch (error) {
    console.error('error saving task:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
    setTimeout(resetForm, 300)
  }
}

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800">{{ modalTitle }}</h2>
          <button
            @click="handleClose"
            :disabled="isSubmitting"
            class="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Enter task title"
              :class="
                errors.title
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              "
              class="w-full px-4 py-2.5 border rounded-lg outline-none transition text-gray-900"
            />
            <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model.number="formData.category_id"
              :class="
                errors.category_id
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              "
              class="w-full px-4 py-2.5 border rounded-lg outline-none transition bg-white text-gray-700"
            >
              <option :value="0" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <p v-if="errors.category_id" class="text-red-500 text-sm mt-1">
              {{ errors.category_id }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Description </label>
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="Enter task description (optional)"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition resize-none text-gray-700"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Priority </label>
              <select
                v-model="formData.priority"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition bg-white text-gray-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Due Date </label>
              <input
                v-model="formData.due_date"
                type="date"
                :min="getTodayDate()"
                :class="
                  errors.due_date
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                "
                class="w-full px-4 py-2.5 border rounded-lg outline-none transition text-gray-800"
              />
              <p v-if="errors.due_date" class="text-red-500 text-sm mt-1">{{ errors.due_date }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional- auto-generate )
            </label>
            <input
              v-model="formData.image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition text-gray-700"
            />
          </div>

          <div v-if="isEditMode" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              v-model="formData.completed"
              type="checkbox"
              id="completed"
              class="w-5 h-5 cursor-pointer accent-blue-600"
            />
            <label for="completed" class="text-sm font-medium text-gray-700 cursor-pointer">
              Mark as completed
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="handleClose"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="isSubmitting"
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
