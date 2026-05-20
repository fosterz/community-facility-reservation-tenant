<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import StatCard from '@/components/ui/StatCard.vue'

const summary = ref({
  totalBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  noShowBookings: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  totalMembers: 0,
  activeMembers: 0,
})
const loading = ref(true)
const fromDate = ref('')
const toDate = ref('')

async function fetchReport() {
  loading.value = true
  try {
    const { data } = await api.get('/community/reports/summary', {
      params: { from: fromDate.value || undefined, to: toDate.value || undefined }
    })
    summary.value = data.data
  } catch {
    // defaults
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)

function pct(value: number, total: number): string {
  if (!total) return '0%'
  return `${Math.max(1, Math.round((value / total) * 100))}%`
}

const collectedRevenue = computed(() => summary.value.totalRevenue - summary.value.pendingRevenue)
const inactiveMembers = computed(() => summary.value.totalMembers - summary.value.activeMembers)
const completionRate = computed(() => {
  const t = summary.value.totalBookings
  if (!t) return '0%'
  return `${Math.round((summary.value.confirmedBookings / t) * 100)}%`
})
const collectionRate = computed(() => {
  const t = summary.value.totalRevenue
  if (!t) return '0%'
  return `${Math.round((collectedRevenue.value / t) * 100)}%`
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-900">Reports</h1>
      <div class="flex gap-3 items-center flex-wrap">
        <input v-model="fromDate" type="date" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <span class="text-slate-400 text-sm">to</span>
        <input v-model="toDate" type="date" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        <button
          class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          @click="fetchReport"
        >
          Apply
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Bookings" :value="summary.totalBookings" icon="calendar" color="indigo" />
      <StatCard label="Confirmed" :value="summary.confirmedBookings" icon="check-circle" color="emerald" />
      <StatCard label="Cancelled" :value="summary.cancelledBookings" icon="trash" color="rose" />
      <StatCard label="No-Shows" :value="summary.noShowBookings" icon="clock" color="amber" />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Revenue" :value="`₹${summary.totalRevenue.toLocaleString('en-IN')}`" icon="currency-rupee" color="emerald" />
      <StatCard label="Pending Revenue" :value="`₹${summary.pendingRevenue.toLocaleString('en-IN')}`" icon="banknote" color="amber" />
      <StatCard label="Total Members" :value="summary.totalMembers" icon="users" color="indigo" />
      <StatCard label="Active Members" :value="summary.activeMembers" icon="user" color="sky" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Booking breakdown -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-700">Booking Breakdown</p>
          <span class="text-xs text-slate-400">{{ summary.totalBookings }} total</span>
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /> Confirmed
              </span>
              <span class="text-xs font-medium text-slate-700">{{ summary.confirmedBookings }} · {{ pct(summary.confirmedBookings, summary.totalBookings) }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div :style="{ width: pct(summary.confirmedBookings, summary.totalBookings) }" class="h-full bg-emerald-500 rounded-full transition-all duration-700" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" /> Cancelled
              </span>
              <span class="text-xs font-medium text-slate-700">{{ summary.cancelledBookings }} · {{ pct(summary.cancelledBookings, summary.totalBookings) }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div :style="{ width: pct(summary.cancelledBookings, summary.totalBookings) }" class="h-full bg-rose-400 rounded-full transition-all duration-700" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" /> No-Show
              </span>
              <span class="text-xs font-medium text-slate-700">{{ summary.noShowBookings }} · {{ pct(summary.noShowBookings, summary.totalBookings) }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div :style="{ width: pct(summary.noShowBookings, summary.totalBookings) }" class="h-full bg-amber-400 rounded-full transition-all duration-700" />
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-400">Completion rate</span>
          <span class="text-sm font-semibold text-emerald-600">{{ completionRate }}</span>
        </div>
      </div>

      <!-- Revenue & Members -->
      <div class="space-y-4">
        <!-- Revenue collection -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">Revenue Collection</p>
            <span class="text-xs text-slate-400">₹{{ summary.totalRevenue.toLocaleString('en-IN') }} total</span>
          </div>

          <div>
            <div class="flex h-3 rounded-full overflow-hidden bg-slate-100">
              <div :style="{ width: pct(collectedRevenue, summary.totalRevenue) }" class="bg-emerald-500 transition-all duration-700" />
              <div :style="{ width: pct(summary.pendingRevenue, summary.totalRevenue) }" class="bg-amber-300 transition-all duration-700" />
            </div>
            <div class="flex gap-4 mt-2.5">
              <span class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                Collected · ₹{{ collectedRevenue.toLocaleString('en-IN') }}
              </span>
              <span class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-2 h-2 rounded-full bg-amber-300 flex-shrink-0" />
                Pending · ₹{{ summary.pendingRevenue.toLocaleString('en-IN') }}
              </span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400">Collection rate</span>
            <span class="text-sm font-semibold text-emerald-600">{{ collectionRate }}</span>
          </div>
        </div>

        <!-- Member activity -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">Member Activity</p>
            <span class="text-xs text-slate-400">{{ summary.totalMembers }} members</span>
          </div>

          <div>
            <div class="flex h-3 rounded-full overflow-hidden bg-slate-100">
              <div :style="{ width: pct(summary.activeMembers, summary.totalMembers) }" class="bg-indigo-500 transition-all duration-700" />
              <div :style="{ width: pct(inactiveMembers, summary.totalMembers) }" class="bg-slate-300 transition-all duration-700" />
            </div>
            <div class="flex gap-4 mt-2.5">
              <span class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                Active · {{ summary.activeMembers }}
              </span>
              <span class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                Inactive · {{ inactiveMembers }}
              </span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400">Active rate</span>
            <span class="text-sm font-semibold text-indigo-600">{{ pct(summary.activeMembers, summary.totalMembers) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
