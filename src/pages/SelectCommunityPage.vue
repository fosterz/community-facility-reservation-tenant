<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const loading = ref('')
const error = ref('')

async function select(id: string) {
  loading.value = id
  error.value = ''
  try {
    await auth.selectCommunity(id)
    router.push('/home')
  } catch {
    error.value = 'Failed to select community.'
  } finally {
    loading.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold text-slate-900">Select Your Community</h1>
        <p class="text-sm text-slate-500 mt-1">Your account is linked to multiple communities.</p>
      </div>

      <div class="space-y-3">
        <button
          v-for="c in auth.communities"
          :key="c.id"
          :disabled="!!loading"
          class="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all disabled:opacity-60"
          @click="select(c.id)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
            </div>
            <div>
              <p class="font-semibold text-slate-900">{{ c.name }}</p>
              <p class="text-sm text-slate-400">{{ c.city }}, {{ c.state }}</p>
            </div>
            <div v-if="loading === c.id" class="ml-auto">
              <span class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin block" />
            </div>
          </div>
        </button>
      </div>

      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ error }}
      </div>

      <button class="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 transition-colors" @click="router.push('/login')">
        ← Back to login
      </button>
    </div>
  </div>
</template>
