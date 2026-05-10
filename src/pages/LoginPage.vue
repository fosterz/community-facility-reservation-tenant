<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ mobile: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const result = await auth.login(form.mobile, form.password)
    if (result.multiCommunity) {
      router.push('/select-community')
    } else {
      router.push('/home')
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: string[] } } }
    error.value = e.response?.data?.message ?? e.response?.data?.errors?.[0] ?? 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 backdrop-blur">
          🏘️
        </div>
        <h1 class="text-2xl font-bold text-white">Community Facility Reservation</h1>
        <p class="text-indigo-300 text-sm mt-1">Member Portal</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6">Sign In</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Mobile Number</label>
            <input
              v-model="form.mobile"
              type="tel"
              placeholder="9876543210"
              inputmode="numeric"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sign In
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">Not a member yet?</p>
          <RouterLink to="/discover" class="text-sm text-indigo-600 font-medium hover:text-indigo-800">
            Find your community →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
