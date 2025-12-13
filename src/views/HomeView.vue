<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import type { CreateTaskPayload, Task } from '../types'
import imgError from '../assets/images/imgError.jpeg'
import TaskFormModal from '@/components/TaskFormModal.vue'

const taskStore = useTaskStore()

onMounted(async () => {
  await taskStore.fetchCategories()
  await taskStore.fetchTasks()
})

const selectedCategory = ref('all')
const imageErrors = ref<Record<number, boolean>>({})
const isFormModalOpen = ref(false)
const editingTask = ref<Task | null>(null)

const filterAll = () => taskStore.setFilter('all')
const filterStatus = (isCompleted: boolean) => taskStore.setFilter('status', isCompleted)
const filterPriority = (prio: string) => taskStore.setFilter('priority', prio)

const nextPage = () => taskStore.changePage(taskStore.currentPage + 1)
const prevPage = () => taskStore.changePage(taskStore.currentPage - 1)

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

const saveTask = async (taskData: CreateTaskPayload & { completed?: boolean }) => {
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskData)
    } else {
      await taskStore.addTask(taskData)
    }

    closeModal()
  } catch (error) {
    alert('Failed to save task: ' + error)
  }
}

const deleteTask = async (taskId: number) => {
  if (confirm('Are you sure you want to delete this task?')) {
    await taskStore.deleteTask(taskId)
  }
}

const toggleTask = async (taskId: number) => {
  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (task) {
    await taskStore.updateTask(taskId, { completed: !task.completed })
  }
}

const getCategoryById = (id: number) => {
  return taskStore.categories.find((cat) => cat.id === id)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const handleImageError = (taskId: number) => {
  imageErrors.value[taskId] = true
}

const filteredTasks = computed(() => {
  if (selectedCategory.value === 'all') {
    return taskStore.tasks
  }
  const category = taskStore.categories.find((c) => c.name === selectedCategory.value)
  return taskStore.tasks.filter((t) => t.category_id === category?.id)
})

const remainingTasks = computed(() => taskStore.tasks.filter((t) => !t.completed).length)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div
      v-if="taskStore.isLoading && taskStore.tasks.length === 0"
      class="flex justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
    </div>

    <div
      v-else-if="taskStore.error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ taskStore.error }}</span>
    </div>

    <div v-else>
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-700 mb-4">Task Manager Web Application</h1>

        <div class="flex flex-wrap justify-center gap-2 mb-6">
          <button
            @click="filterAll"
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
            v-for="cat in taskStore.categories"
            :key="cat.id"
            @click="selectedCategory = cat.name"
            :class="
              selectedCategory === cat.name
                ? 'text-white'
                : 'bg-gray-800 text-white border border-gray-300'
            "
            :style="selectedCategory === cat.name ? { backgroundColor: cat.color } : {}"
            class="px-4 py-2 rounded-lg text-sm font-medium transition hover:shadow-md flex justify-center items-center gap-2"
          >
            <img
              v-if="cat.icon_url"
              :src="cat.icon_url"
              :class="{
                grayscale: cat.image_filter === 'grayscale',
                sepia: cat.image_filter === 'sepia',
                'blur-sm': cat.image_filter === 'blur',
              }"
              class="w-full h-full object-cover"
              alt="icon"
            />
            {{ cat.name }}
          </button>
        </div>

        <button
          @click="filterStatus(false)"
          :class="
            taskStore.currentFilter.type === 'status' && taskStore.currentFilter.value === false
              ? 'bg-blue-900 text-white'
              : 'bg-blue-600 border'
          "
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Pending
        </button>

        <button
          @click="filterStatus(true)"
          :class="
            taskStore.currentFilter.type === 'status' && taskStore.currentFilter.value === true
              ? 'bg-green-900 text-white'
              : 'bg-green-600 border'
          "
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Done
        </button>

        <div class="flex items-center gap-2 border-l pl-2 ml-2 border-gray-300">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline"
            >Priority</span
          >

          <button
            @click="filterPriority('high')"
            :class="
              taskStore.currentFilter.type === 'priority' &&
              taskStore.currentFilter.value === 'high'
                ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
            "
            class="px-3 py-1.5 rounded-md text-xs font-bold transition"
          >
            High
          </button>

          <button
            @click="filterPriority('medium')"
            :class="
              taskStore.currentFilter.type === 'priority' &&
              taskStore.currentFilter.value === 'medium'
                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500 ring-offset-1'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-yellow-50'
            "
            class="px-3 py-1.5 rounded-md text-xs font-bold transition"
          >
            Medium
          </button>

          <button
            @click="filterPriority('low')"
            :class="
              taskStore.currentFilter.type === 'priority' && taskStore.currentFilter.value === 'low'
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'
            "
            class="px-3 py-1.5 rounded-md text-xs font-bold transition"
          >
            Low
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
          v-for="task in taskStore.tasks"
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
              <img v-else :src="imgError" alt="Fallback" class="w-full h-full object-cover" />
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

              <div class="flex flex-wrap gap-2 text-xs">
                <span
                  v-if="getCategoryById(task.category_id)"
                  class="px-2 py-1 rounded-md font-medium text-white flex items-center gap-1"
                  :style="{ backgroundColor: getCategoryById(task.category_id)?.color }"
                >
                  <img
                    v-if="getCategoryById(task.category_id)?.icon_url"
                    :src="getCategoryById(task.category_id)?.icon_url"
                    :class="{
                      grayscale: getCategoryById(task.category_id)?.image_filter === 'grayscale',
                      sepia: getCategoryById(task.category_id)?.image_filter === 'sepia',
                      'blur-sm': getCategoryById(task.category_id)?.image_filter === 'blur',
                    }"
                    alt="icon"
                    class="w-4 h-4"
                  />
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
              title="Edit"
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
              title="Delete"
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
      </div>
    </div>

    <TaskFormModal
      :is-open="isFormModalOpen"
      :task="editingTask"
      :categories="taskStore.categories"
      @close="closeModal"
      @save="saveTask"
    />

    <div class="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
      <button
        @click="prevPage"
        :disabled="taskStore.currentPage === 1 || taskStore.isLoading"
        class="btn btn-outline btn-sm bg-gray-950"
      >
        Previous
      </button>

      <span class="text-sm font-medium text-gray-600"> Page {{ taskStore.currentPage }} </span>

      <button
        @click="nextPage"
        :disabled="!taskStore.hasMoreTasks || taskStore.isLoading"
        class="btn btn-outline btn-sm bg-gray-950"
      >
        Next
      </button>
    </div>
  </div>
</template>
