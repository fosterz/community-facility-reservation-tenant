<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Booking } from '@/types'
import StatCard from '@/components/ui/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const stats = ref({
  totalMembers: 0,
  activeBookings: 0,
  pendingPayments: 0,
  facilities: 0,
  todayBookings: 0,
  pendingJoinRequests: 0,
})
const loading = ref(true)
const recentBookings = ref<Booking[]>([])
const recentLoading = ref(true)

onMounted(async () => {
  try {
    const [dashRes, bookingsRes] = await Promise.all([
      api.get('/community/dashboard'),
      api.get('/community/bookings', { params: { limit: 10 } }),
    ])
    stats.value = dashRes.data.data
    recentBookings.value = bookingsRes.data.data?.items ?? []
  } catch {
    // defaults
  } finally {
    loading.value = false
    recentLoading.value = false
  }
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

const paymentClass: Record<string, string> = {
  Paid: 'text-emerald-600',
  Pending: 'text-amber-600',
  Free: 'text-slate-400',
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-6">Dashboard</h1>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard label="Total Members" :value="stats.totalMembers" icon="users" color="indigo" />
      <StatCard label="Active Bookings" :value="stats.activeBookings" icon="calendar" color="emerald" />
      <StatCard label="Pending Payments" :value="stats.pendingPayments" icon="credit-card" color="amber" />
      <StatCard label="Facilities" :value="stats.facilities" icon="building-office" color="sky" />
      <StatCard label="Today's Bookings" :value="stats.todayBookings" icon="chart-bar" color="indigo" />
      <StatCard label="Join Requests" :value="stats.pendingJoinRequests" icon="inbox" color="rose" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <p class="text-sm font-semibold text-slate-700">Recent Activity</p>
        <RouterLink to="/community/bookings" class="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          View all →
        </RouterLink>
      </div>

      <div v-if="recentLoading" class="p-4 space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      <div v-else-if="recentBookings.length === 0" class="py-12 text-center text-slate-400 text-sm">
        No bookings yet.
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="b in recentBookings"
          :key="b.id"
          class="px-6 py-3 flex items-center gap-3"
        >
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
            {{ b.memberName?.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ b.memberName }}</p>
            <p class="text-xs text-slate-400 truncate">{{ b.facilityName }} · {{ formatDate(b.date) }} · Unit {{ b.memberUnit }}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <StatusBadge :status="b.status" />
            <span v-if="b.paymentStatus !== 'Free'" :class="['text-xs font-medium', paymentClass[b.paymentStatus]]">
              {{ b.paymentStatus === 'Paid' ? 'Paid' : `₹${b.amountDue}` }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
