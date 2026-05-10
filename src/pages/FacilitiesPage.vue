<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Facility } from '@/types'

const router = useRouter()
const facilities = ref<Facility[]>([])
const loading = ref(true)
const search = ref('')

async function fetchFacilities() {
  loading.value = true
  try {
    const { data } = await api.get('/member/facilities', { params: { search: search.value || undefined } })
    facilities.value = data.data
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(timer); timer = setTimeout(fetchFacilities, 400) })
onMounted(fetchFacilities)

const categoryIcons: Record<string, string> = {
  Sports: '⚽', Recreation: '🎮', Meeting: '📋', Banquet: '🎉', Gym: '💪', Pool: '🏊', Other: '🏢'
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-4">Facilities</h1>

    <div class="relative mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Search facilities..."
        class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
    </div>

    <div v-if="loading" class="grid grid-cols-2 gap-3">
      <div v-for="i in 4" :key="i" class="h-36 bg-slate-100 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="facilities.length === 0" class="text-center py-12 text-slate-400">
      No facilities found.
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
      <div
        v-for="f in facilities"
        :key="f.id"
        :class="['bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md', f.status !== 'Active' ? 'opacity-60' : 'hover:border-indigo-300']"
        @click="f.status === 'Active' && router.push(`/facilities/${f.id}`)"
      >
        <div class="h-24 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-4xl">
          {{ categoryIcons[f.category] ?? '🏢' }}
        </div>
        <div class="p-3">
          <p class="font-semibold text-slate-900 text-sm truncate">{{ f.name }}</p>
          <p class="text-xs text-slate-400">{{ f.category }}</p>
          <div class="flex items-center justify-between mt-1.5">
            <p class="text-xs font-medium text-indigo-600">
              {{ f.pricing.isPaid ? `₹${f.pricing.chargePerSlot}/slot` : 'Free' }}
            </p>
            <span v-if="f.status !== 'Active'" class="text-xs text-amber-600 font-medium capitalize">{{ f.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
