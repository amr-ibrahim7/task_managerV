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

const filterCategory = (id: number) => taskStore.updateFilter('category', id)
const filterStatus = (status: boolean) => taskStore.updateFilter('status', status)
const filterPriority = (priority: string) => taskStore.updateFilter('priority', priority)
const clearFilters = () => taskStore.clearAllFilters()

const imageErrors = ref<Record<number, boolean>>({})
const isFormModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const isSaving = ref(false)
const deleteModalOpen = ref(false)
const taskToDeleteId = ref<number | null>(null)
const toast = ref({ show: false, message: '', type: 'success' })

const nextPage = () => taskStore.changePage(taskStore.currentPage + 1)
const prevPage = () => taskStore.changePage(taskStore.currentPage - 1)

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

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
  isSaving.value = true

  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskData)
      showToast('Task updated successfully', 'success')
    } else {
      await taskStore.addTask(taskData)
      showToast('Task created successfully', 'success')
    }
    closeModal()
  } catch (error) {
    showToast('Failed to save task', 'error')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (taskId: number) => {
  taskToDeleteId.value = taskId
  deleteModalOpen.value = true
}

const executeDelete = async () => {
  if (taskToDeleteId.value) {
    await taskStore.deleteTask(taskToDeleteId.value)
    showToast('Task deleted successfully', 'success')
    deleteModalOpen.value = false
    taskToDeleteId.value = null
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

const remainingTasks = computed(() => taskStore.tasks.filter((t) => !t.completed).length)

const hasActiveFilters = computed(() => {
  return (
    taskStore.filters.category !== null ||
    taskStore.filters.status !== null ||
    taskStore.filters.priority !== null
  )
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div
      v-if="taskStore.isLoading && taskStore.tasks.length === 0 && !hasActiveFilters"
      class="flex justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div
      v-else-if="taskStore.error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
    >
      <strong class="font-bold">Error: </strong>
      <span>{{ taskStore.error }}</span>
    </div>

    <div v-else>
      <header class="mb-10 text-center">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
          Task Manager Web Application
        </h1>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div class="flex flex-col gap-6">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold text-gray-500 uppercase tracking-wider"
                  >Categories</span
                >
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  class="text-xs text-blue-600 hover:underline font-medium"
                >
                  Clear All Filters
                </button>
              </div>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  v-for="cat in taskStore.categories"
                  :key="cat.id"
                  @click="filterCategory(cat.id)"
                  :style="{ backgroundColor: cat.color }"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 text-white"
                  :class="
                    taskStore.filters.category === cat.id
                      ? 'ring-4 ring-offset-2 ring-gray-300 scale-105 shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  "
                >
                  <img
                    v-if="cat.icon_url"
                    :src="cat.icon_url"
                    class="w-4 h-4 brightness-0 invert"
                    alt=""
                  />
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              <div>
                <span class="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3"
                  >Status</span
                >
                <div class="flex gap-2 justify-center md:justify-start">
                  <button
                    @click="filterStatus(false)"
                    :class="
                      taskStore.filters.status === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    "
                    class="flex-1 py-2 rounded-lg text-sm font-bold transition"
                  >
                    Pending
                  </button>
                  <button
                    @click="filterStatus(true)"
                    :class="
                      taskStore.filters.status === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    "
                    class="flex-1 py-2 rounded-lg text-sm font-bold transition"
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div>
                <span class="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3"
                  >Priority</span
                >
                <div class="flex gap-2 justify-center md:justify-start">
                  <button
                    v-for="prio in ['low', 'medium', 'high']"
                    :key="prio"
                    @click="filterPriority(prio)"
                    :class="[
                      'flex-1 py-2 rounded-lg text-sm font-bold transition capitalize',
                      taskStore.filters.priority === prio
                        ? prio === 'high'
                          ? 'bg-red-600 text-white'
                          : prio === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    ]"
                  >
                    {{ prio }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 mx-auto transition-transform hover:scale-105 shadow-lg shadow-blue-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Create New Task
        </button>
      </header>

      <div class="grid gap-4">
        <div v-if="taskStore.isLoading" class="text-center py-4 text-blue-600 font-medium">
          Updating results...
        </div>

        <div
          v-for="task in taskStore.tasks"
          :key="task.id"
          class="bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        >
          <!-- Checkbox -->
          <div class="flex items-center">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleTask(task.id)"
              class="w-6 h-6 cursor-pointer accent-blue-600 shrink-0 rounded-full"
            />
          </div>

          <div
            class="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
          >
            <img
              v-if="!imageErrors[task.id] && task.image_url"
              :src="task.image_url"
              :alt="task.title"
              @error="handleImageError(task.id)"
              class="w-full h-full object-cover"
            />
            <img v-else :src="imgError" alt="Fallback" class="w-full h-full object-cover" />
          </div>

          <div class="flex-1 min-w-0 text-center sm:text-left">
            <h3
              class="text-lg font-bold text-gray-800 mb-1"
              :class="{ 'line-through text-gray-400 opacity-70': task.completed }"
            >
              {{ task.title }}
            </h3>
            <p
              class="text-sm text-gray-500 mb-3 line-clamp-1"
              :class="{ 'line-through opacity-50': task.completed }"
            >
              {{ task.description || 'No description provided' }}
            </p>

            <div class="flex flex-wrap justify-center sm:justify-start gap-2">
              <span
                v-if="getCategoryById(task.category_id)"
                class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider text-white flex items-center gap-1.5"
                :style="{ backgroundColor: getCategoryById(task.category_id)?.color }"
              >
                {{ getCategoryById(task.category_id)?.name }}
              </span>
              <span
                class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                :class="{
                  'bg-red-100 text-red-700': task.priority === 'high',
                  'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                  'bg-blue-100 text-blue-700': task.priority === 'low',
                }"
              >
                {{ task.priority }}
              </span>
              <span
                class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600"
              >
                {{ formatDate(task.due_date) }}
              </span>
            </div>
          </div>

          <div class="flex sm:flex-col gap-2 shrink-0">
            <button
              @click="openEditModal(task)"
              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              @click="confirmDelete(task.id)"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!taskStore.isLoading && taskStore.tasks.length === 0"
        class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
      >
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-gray-500 font-medium mb-4">No tasks match your current filters</p>
        <button @click="clearFilters" class="text-blue-600 font-bold hover:underline">
          Clear all filters
        </button>
      </div>

      <div class="flex justify-center items-center gap-6 mt-12">
        <button
          @click="prevPage"
          :disabled="taskStore.currentPage === 1 || taskStore.isLoading"
          class="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
        >
          Prev
        </button>
        <span class="text-sm font-bold text-gray-800">Page {{ taskStore.currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="!taskStore.hasMoreTasks || taskStore.isLoading"
          class="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
        >
          Next
        </button>
      </div>

      <div class="mt-8 text-center text-gray-400 text-sm font-medium">
        Pending Tasks: <span class="text-blue-600">{{ remainingTasks }}</span>
      </div>
    </div>

    <TaskFormModal
      :is-open="isFormModalOpen"
      :task="editingTask"
      :categories="taskStore.categories"
      :is-loading="isSaving"
      @close="closeModal"
      @save="saveTask"
    />

    <div v-if="toast.show" class="fixed bottom-8 right-8 z-100 animate-bounce">
      <div
        :class="toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'"
        class="text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3"
      >
        <span v-if="toast.type === 'success'">✅</span>
        <span v-else>⚠️</span>
        {{ toast.message }}
      </div>
    </div>

    <Transition name="modal">
      <div
        v-if="deleteModalOpen"
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-110 p-4"
      >
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-in-center">
          <div
            class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-3xl mb-4 mx-auto"
          >
            🗑️
          </div>
          <h3 class="text-xl font-extrabold text-gray-800 text-center mb-2">Delete Task?</h3>
          <p class="text-gray-500 text-center mb-8">
            This action is permanent and cannot be reversed.
          </p>
          <div class="flex gap-3">
            <button
              @click="deleteModalOpen = false"
              class="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              @click="executeDelete"
              class="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.scale-in-center {
  animation: scale-in-center 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
@keyframes scale-in-center {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
