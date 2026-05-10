<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const changingPassword = ref(false)
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const pwError = ref('')
const pwSuccess = ref(false)
const pwLoading = ref(false)

async function submitPasswordChange() {
  pwError.value = ''
  if (pwForm.newPassword !== pwForm.confirmPassword) { pwError.value = 'Passwords do not match.'; return }
  if (pwForm.newPassword.length < 8) { pwError.value = 'Min 8 characters.'; return }
  pwLoading.value = true
  try {
    await auth.changePassword(pwForm.currentPassword, pwForm.newPassword)
    pwSuccess.value = true
    changingPassword.value = false
    Object.assign(pwForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    pwError.value = e.response?.data?.message ?? 'Failed to change password.'
  } finally {
    pwLoading.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-6">Profile</h1>

    <!-- Member card -->
    <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white mb-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
          {{ auth.user?.name?.charAt(0) }}
        </div>
        <div>
          <p class="font-bold text-lg">{{ auth.user?.name }}</p>
          <p class="text-indigo-200 text-sm">Unit {{ auth.user?.unit }}</p>
          <p class="text-indigo-200 text-xs font-mono mt-0.5">{{ auth.user?.membershipId }}</p>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 mb-4">
      <div class="px-4 py-3 flex justify-between text-sm">
        <span class="text-slate-500">Community</span>
        <span class="font-medium text-slate-900">{{ auth.user?.communityName }}</span>
      </div>
      <div class="px-4 py-3 flex justify-between text-sm">
        <span class="text-slate-500">Mobile</span>
        <span class="font-medium text-slate-900">{{ auth.user?.mobile }}</span>
      </div>
      <div class="px-4 py-3 flex justify-between text-sm">
        <span class="text-slate-500">Unit</span>
        <span class="font-medium text-slate-900">{{ auth.user?.unit }}</span>
      </div>
    </div>

    <!-- Change password -->
    <div class="bg-white border border-slate-200 rounded-xl mb-4">
      <button
        class="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
        @click="changingPassword = !changingPassword"
      >
        <span>🔑 Change Password</span>
        <span class="text-slate-400">{{ changingPassword ? '▲' : '▼' }}</span>
      </button>
      <div v-if="changingPassword" class="px-4 pb-4 space-y-3">
        <div v-if="pwSuccess" class="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2">
          Password changed successfully.
        </div>
        <input v-model="pwForm.currentPassword" type="password" placeholder="Current password" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <input v-model="pwForm.newPassword" type="password" placeholder="New password (min 8 chars)" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <input v-model="pwForm.confirmPassword" type="password" placeholder="Confirm new password" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <div v-if="pwError" class="text-red-600 text-xs">{{ pwError }}</div>
        <button
          :disabled="pwLoading"
          class="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          @click="submitPasswordChange"
        >
          {{ pwLoading ? 'Saving...' : 'Save Password' }}
        </button>
      </div>
    </div>

    <!-- Sign out -->
    <button
      class="w-full border border-red-200 text-red-600 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors text-sm"
      @click="logout"
    >
      Sign Out
    </button>
  </div>
</template>
