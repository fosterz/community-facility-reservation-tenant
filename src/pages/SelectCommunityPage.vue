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
            <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-lg flex-shrink-0">
              🏘️
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
