<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, Category } from '../types'
import TaskFormModal from '../components/TaskFormModal.vue'
import task1 from '../assets/images/tas1.jpg'
import imgError from '../assets/images/imgError.jpeg'
import { Icon } from '@iconify/vue'

const categories: Category[] = [
  {
    id: 1,
    name: 'Work',
    color: '#3b82f6',
    icon_url: 'material-symbols:work',
    image_filter: 'default',
    image_seed_offset: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Personal',
    color: '#10b981',
    icon_url: 'material-symbols:person',
    image_filter: 'default',
    image_seed_offset: 200,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Shopping',
    color: '#f59e0b',
    icon_url: 'material-symbols:shopping-bag-speed',
    image_filter: 'default',
    image_seed_offset: 300,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Health',
    color: '#ef4444',
    icon_url: 'material-symbols:health-metrics-rounded',
    image_filter: 'default',
    image_seed_offset: 400,
    created_at: new Date().toISOString(),
  },
]

const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'Complete Project Proposal',
    description:
      'Prepare and submit the quarterly project proposal to management team including budget analysis',
    category_id: 1,
    priority: 'high',
    completed: false,
    due_date: '2025-12-10',
    image_url: task1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Buy Groceries for Week',
    description: 'Get milk, eggs, bread, vegetables, and fruits from the supermarket',
    category_id: 2,
    priority: 'medium',
    completed: false,
    due_date: '2025-12-13',
    image_url: task1,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Sprint Planning Meeting',
    description: 'Discuss next sprint goals and assign tasks to the development team',
    category_id: 1,
    priority: 'high',
    completed: true,
    due_date: '2025-12-10',
    image_url: task1,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Evening Workout Session',
    description: 'Chest and triceps workout at the gym with cardio',
    category_id: 4,
    priority: 'low',
    completed: false,
    due_date: '2025-12-12',
    image_url: task1,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Order New Laptop',
    description: 'Research and purchase new MacBook Pro for development',
    category_id: 3,
    priority: 'medium',
    completed: false,
    due_date: '2024-12-15',
    image_url: task1,
    created_at: new Date().toISOString(),
  },
])

const selectedCategory = ref('all')
const imageErrors = ref<Record<number, boolean>>({})
const isFormModalOpen = ref(false)
const editingTask = ref<Task | null>(null)

const openAddModal = () => {
  editingTask.value = null
  isFormModalOpen.value = true
}

const openEditModal = (task: Task) => {
  editingTask.value = { ...task }
  isFormModalOpen.value = true
}

const closeModal = () => {
  isFormModalOpen.value = false
  editingTask.value = null
}

const saveTask = (taskData: any) => {
  if (editingTask.value) {
    const index = tasks.value.findIndex((t) => t.id === editingTask.value!.id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...taskData,
        updated_at: new Date().toISOString(),
      } as Task
    }
  } else {
    const newTask: Task = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description || null,
      category_id: taskData.category_id,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      completed: false,
      image_url: task1,
      created_at: new Date().toISOString(),
    }
    tasks.value.unshift(newTask)
  }
}

const deleteTask = (taskId: number) => {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
  }
}

const getCategoryById = (id: number) => {
  return categories.find((cat) => cat.id === id)
}

const filteredTasks = computed(() => {
  if (selectedCategory.value === 'all') {
    return tasks.value
  }
  const category = categories.find((c) => c.name === selectedCategory.value)
  return tasks.value.filter((t) => t.category_id === category?.id)
})

const remainingTasks = computed(() => tasks.value.filter((t) => !t.completed).length)

const handleImageError = (taskId: number) => {
  imageErrors.value[taskId] = true
}

const toggleTask = (taskId: number) => {
  const task = tasks.value.find((t) => t.id === taskId)
  if (task) {
    task.completed = !task.completed
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-700 mb-4">Task Manager Web Application</h1>

      <div class="flex flex-wrap justify-center gap-2 mb-6">
        <button
          @click="selectedCategory = 'all'"
          :class="
            selectedCategory === 'all'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          "
          class="px-4 py-2 rounded-lg text-sm font-medium transition hover:shadow-md"
        >
          All Tasks
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCategory = cat.name"
          :class="
            selectedCategory === cat.name
              ? 'text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          "
          :style="selectedCategory === cat.name ? { backgroundColor: cat.color } : {}"
          class="px-4 py-2 rounded-lg text-sm font-medium transition hover:shadow-md flex justify-center items-center gap-2"
        >
          <Icon :icon="cat.icon_url" width="16" height="16" />
          {{ cat.name }}
        </button>
      </div>

      <button
        @click="openAddModal"
        class="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add new task
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white border border-gray-300 rounded-2xl hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-start gap-4 p-4">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTask(task.id)"
            class="w-5 h-5 mt-1 cursor-pointer accent-gray-600 shrink-0"
          />

          <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img
              v-if="!imageErrors[task.id] && task.image_url"
              :src="task.image_url"
              :alt="task.title"
              @error="handleImageError(task.id)"
              class="w-full h-full object-cover"
            />
            <img v-else :src="imgError" alt="Fallback Image" class="w-full h-full object-cover" />
          </div>

          <div class="flex-1 min-w-0">
            <h3
              class="font-semibold text-gray-700 mb-1"
              :class="{ 'line-through text-gray-400': task.completed }"
            >
              {{ task.title }}
            </h3>
            <p
              class="text-sm text-gray-900 mb-2 line-clamp-2"
              :class="{ 'line-through text-gray-400': task.completed }"
            >
              {{ task.description }}
            </p>

            <div class="flex flex-wrap gap-2 text-xs" :class="{ 'line-through': task.completed }">
              <span
                class="px-2 py-1 rounded-md font-medium text-white flex justify-center items-center gap-2"
                :style="{ backgroundColor: getCategoryById(task.category_id)?.color }"
              >
                <Icon :icon="getCategoryById(task.category_id)!.icon_url" width="16" height="16" />
                {{ getCategoryById(task.category_id)?.name }}
              </span>
              <span
                class="px-2 py-1 rounded-md font-medium"
                :class="{
                  'bg-red-100 text-red-700': task.priority === 'high',
                  'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                  'bg-blue-100 text-blue-700': task.priority === 'low',
                }"
              >
                {{ task.priority }}
              </span>
              <span class="px-2 py-1 rounded-md font-medium bg-gray-100 text-gray-700">
                {{ formatDate(task.due_date) }}
              </span>
            </div>
          </div>

          <button
            @click="openEditModal(task)"
            class="text-gray-400 hover:text-blue-600 transition shrink-0 p-1"
            title="Edit task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            @click="deleteTask(task.id)"
            class="text-gray-400 hover:text-red-600 transition shrink-0 p-1"
            title="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p class="text-lg text-gray-600 mb-4">No tasks found</p>
      <button
        @click="openAddModal"
        class="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
      >
        Create your first task
      </button>
    </div>

    <div class="mt-8 text-center text-gray-500">
      <p class="text-sm mb-2">
        Your remaining todos: <span class="font-semibold">{{ remainingTasks }}</span>
      </p>
      <p class="text-sm italic">
        Never do tomorrow what you can do today. Procrastination is the thief of time.
      </p>
    </div>

    <TaskFormModal
      :is-open="isFormModalOpen"
      :task="editingTask"
      :categories="categories"
      @close="closeModal"
      @save="saveTask"
    />
  </div>
</template>
