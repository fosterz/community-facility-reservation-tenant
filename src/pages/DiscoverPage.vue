<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Community } from '@/types'

const communities = ref<Community[]>([])
const loading = ref(false)
const lat = ref('')
const lng = ref('')
const radius = ref(10)
const search = ref('')
const requested = ref<Set<string>>(new Set())
const requestForm = ref<{ community: Community | null; name: string; mobile: string; unit: string }>({
  community: null, name: '', mobile: '', unit: ''
})
const submitting = ref(false)
const submitSuccess = ref(false)
const error = ref('')

async function discover() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/public/communities/nearby', {
      params: { lat: lat.value || undefined, lng: lng.value || undefined, radius: radius.value, search: search.value || undefined }
    })
    communities.value = data.data
  } catch {
    error.value = 'Could not load communities.'
  } finally {
    loading.value = false
  }
}

async function useMyLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(pos => {
    lat.value = String(pos.coords.latitude)
    lng.value = String(pos.coords.longitude)
    discover()
  })
}

async function submitRequest() {
  if (!requestForm.value.community) return
  submitting.value = true
  try {
    await api.post(`/public/communities/${requestForm.value.community.id}/join-request`, {
      applicantName: requestForm.value.name,
      applicantMobile: requestForm.value.mobile,
      unitNumber: requestForm.value.unit,
    })
    requested.value.add(requestForm.value.community.id)
    submitSuccess.value = true
    requestForm.value = { community: null, name: '', mobile: '', unit: '' }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to submit request.'
  } finally {
    submitting.value = false
  }
}

onMounted(discover)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <h1 class="font-bold text-slate-900">Find Your Community</h1>
        <RouterLink to="/login" class="text-sm text-indigo-600 font-medium">Sign In →</RouterLink>
      </div>
    </header>

    <main class="max-w-lg mx-auto px-4 py-6 space-y-4">
      <!-- Search controls -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <input v-model="search" type="search" placeholder="Search by community name..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <div class="flex gap-2">
          <button class="flex-1 text-sm text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors" @click="useMyLocation">
            📍 Use My Location
          </button>
          <button class="flex-1 bg-indigo-600 text-white text-sm rounded-lg py-2 hover:bg-indigo-700 transition-colors" @click="discover">
            Search
          </button>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ error }}</div>

      <!-- Success message -->
      <div v-if="submitSuccess" class="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
        ✅ Join request submitted! The community admin will review it and contact you.
      </div>

      <!-- Communities list -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="communities.length === 0" class="text-center py-8 text-slate-400 text-sm">
        No communities found. Try a different search.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="c in communities"
          :key="c.id"
          class="bg-white border border-slate-200 rounded-xl p-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-slate-900">{{ c.name }}</p>
              <p class="text-sm text-slate-400">{{ c.city }}, {{ c.state }}</p>
            </div>
            <button
              v-if="!requested.has(c.id)"
              class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              @click="requestForm.community = c; submitSuccess = false"
            >
              Request to Join
            </button>
            <span v-else class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">
              Requested ✓
            </span>
          </div>

          <!-- Join form inline -->
          <div v-if="requestForm.community?.id === c.id" class="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <p class="text-sm font-medium text-slate-700">Enter your details to request membership:</p>
            <input v-model="requestForm.name" type="text" placeholder="Full Name *" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            <input v-model="requestForm.mobile" type="tel" placeholder="Mobile Number *" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            <input v-model="requestForm.unit" type="text" placeholder="Unit / Flat No. *" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            <div class="flex gap-2">
              <button class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50" @click="requestForm.community = null">Cancel</button>
              <button
                :disabled="submitting"
                class="flex-1 bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                @click="submitRequest"
              >
                {{ submitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
