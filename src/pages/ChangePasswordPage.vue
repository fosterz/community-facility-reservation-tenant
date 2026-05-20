<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (form.newPassword !== form.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  if (form.newPassword.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  loading.value = true
  try {
    await auth.changePassword(form.currentPassword, form.newPassword)
    router.push('/home')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to change password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-3">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900">Set New Password</h2>
          <p class="text-sm text-slate-500 mt-1">Your password was reset by an admin. Please set a new one to continue.</p>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div v-for="field in [
            { key: 'currentPassword', label: 'Temporary Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ]" :key="field.key" class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">{{ field.label }}</label>
            <input
              v-model="(form as Record<string, string>)[field.key]"
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
            Set Password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
