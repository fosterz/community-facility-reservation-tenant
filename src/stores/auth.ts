import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import type { AuthUser, Community } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const communities = ref<Community[]>([])
  const pendingMobile = ref('')
  const pendingPassword = ref('')

  const isAuthenticated = computed(() => !!user.value)
  const isCommunityUser = computed(() => user.value?.role === 'community_admin' || user.value?.role === 'staff')
  const isCommunityAdmin = computed(() => user.value?.role === 'community_admin')
  const isStaff = computed(() => user.value?.role === 'staff')
  const needsPasswordChange = computed(() => user.value?.forcePasswordChange === true)

  async function login(mobile: string, password: string) {
    const { data } = await api.post('/auth/member/login', { mobile, password })
    if (data.data.communities) {
      communities.value = data.data.communities
      pendingMobile.value = mobile
      pendingPassword.value = password
      return { multiCommunity: true, communities: data.data.communities as Community[] }
    }
    localStorage.setItem('access_token', data.data.accessToken)
    localStorage.setItem('refresh_token', data.data.refreshToken)
    localStorage.setItem('user_role', 'member')
    user.value = data.data.user
    return { multiCommunity: false }
  }

  async function loginCommunityAdmin(email: string, password: string) {
    const { data } = await api.post('/auth/community/login', { email, password })
    localStorage.setItem('access_token', data.data.accessToken)
    localStorage.setItem('refresh_token', data.data.refreshToken)
    localStorage.setItem('user_role', data.data.user.role)
    user.value = data.data.user
  }

  async function selectCommunity(tenantId: string) {
    const { data } = await api.post('/auth/member/login', {
      mobile: pendingMobile.value,
      password: pendingPassword.value,
      tenantId
    })
    localStorage.setItem('access_token', data.data.accessToken)
    localStorage.setItem('refresh_token', data.data.refreshToken)
    localStorage.setItem('user_role', 'member')
    user.value = data.data.user
    pendingMobile.value = ''
    pendingPassword.value = ''
    communities.value = []
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await api.post('/auth/member/change-password', { currentPassword, newPassword })
    if (user.value) user.value.forcePasswordChange = false
  }

  async function fetchProfile() {
    try {
      const role = localStorage.getItem('user_role')
      const isCommunity = role === 'community_admin' || role === 'staff'
      const endpoint = isCommunity ? '/auth/community/me' : '/auth/member/me'
      const { data } = await api.get(endpoint)
      user.value = data.data
    } catch {
      logout()
    }
  }

  function restoreFromStorage() {
    return !!localStorage.getItem('access_token')
  }

  function logout() {
    user.value = null
    communities.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
  }

  return {
    user, communities, isAuthenticated, isCommunityUser, isCommunityAdmin, isStaff, needsPasswordChange,
    login, loginCommunityAdmin, selectCommunity, changePassword, fetchProfile, restoreFromStorage, logout
  }
})
