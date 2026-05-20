<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const tab = ref<'member' | 'admin'>('member')
const memberForm = reactive({ mobile: '', password: '' })
const adminForm = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    if (tab.value === 'member') {
      const result = await auth.login(memberForm.mobile, memberForm.password)
      if (result.multiCommunity) {
        router.push('/select-community')
      } else {
        router.push('/home')
      }
    } else {
      await auth.loginCommunityAdmin(adminForm.email, adminForm.password)
      router.push('/community/dashboard')
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
        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 backdrop-blur">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Community Facility Reservation</h1>
        <p class="text-indigo-300 text-sm mt-1">Community Portal</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Tabs -->
        <div class="flex bg-slate-100 rounded-lg p-1 mb-6">
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-md transition-all', tab === 'member' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700']"
            @click="tab = 'member'"
          >
            Member
          </button>
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-md transition-all', tab === 'admin' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700']"
            @click="tab = 'admin'"
          >
            Admin / Staff
          </button>
        </div>

        <!-- Member login -->
        <form v-if="tab === 'member'" @submit.prevent="handleLogin" class="space-y-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Mobile Number</label>
            <input
              v-model="memberForm.mobile"
              type="tel"
              placeholder="9876543210"
              inputmode="numeric"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Password</label>
            <input
              v-model="memberForm.password"
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

        <!-- Admin / staff login -->
        <form v-else @submit.prevent="handleLogin" class="space-y-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Email</label>
            <input
              v-model="adminForm.email"
              type="email"
              placeholder="admin@community.com"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Password</label>
            <input
              v-model="adminForm.password"
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

        <div v-if="tab === 'member'" class="mt-6 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">Not a member yet?</p>
          <RouterLink to="/discover" class="text-sm text-indigo-600 font-medium hover:text-indigo-800">
            Find your community →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
