<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-base-200 text-base-content">
    <div class="navbar bg-base-100 shadow mb-6">
      <div class="container mx-auto">
        <a class="btn btn-ghost text-xl">Task Manager</a>
      </div>
    </div>

    <main class="container mx-auto px-4 pb-10">
      <RouterView />
    </main>
  </div>
</template>
