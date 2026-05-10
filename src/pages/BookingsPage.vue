<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Booking } from '@/types'

const router = useRouter()
const bookings = ref<Booking[]>([])
const loading = ref(true)
const activeTab = ref<'upcoming' | 'past'>('upcoming')

async function fetchBookings() {
  loading.value = true
  try {
    const status = activeTab.value === 'upcoming' ? 'Confirmed,Waitlisted' : 'Completed,Cancelled,NoShow'
    const { data } = await api.get('/member/bookings', { params: { status } })
    bookings.value = data.data?.items ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchBookings)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

const statusStyle: Record<string, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Waitlisted: 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-red-100 text-red-600',
  Completed: 'bg-indigo-100 text-indigo-700',
  NoShow: 'bg-slate-100 text-slate-500',
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-4">My Bookings</h1>

    <!-- Tabs -->
    <div class="flex bg-slate-100 rounded-xl p-1 mb-4">
      <button
        :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all', activeTab === 'upcoming' ? 'bg-white shadow text-slate-900' : 'text-slate-500']"
        @click="activeTab = 'upcoming'; fetchBookings()"
      >
        Upcoming
      </button>
      <button
        :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all', activeTab === 'past' ? 'bg-white shadow text-slate-900' : 'text-slate-500']"
        @click="activeTab = 'past'; fetchBookings()"
      >
        Past
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-slate-100 rounded-xl animate-pulse" />
    </div>
    <div v-else-if="bookings.length === 0" class="text-center py-12 text-slate-400 text-sm">
      No {{ activeTab }} bookings.
      <div v-if="activeTab === 'upcoming'" class="mt-3">
        <RouterLink to="/facilities" class="text-indigo-600 font-medium">Book a facility →</RouterLink>
      </div>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 cursor-pointer transition-all"
        @click="router.push(`/bookings/${booking.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-900 truncate">{{ booking.facilityName }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(booking.date) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ booking.slots[0]?.startTime }} – {{ booking.slots[booking.slots.length - 1]?.endTime }}
              <span v-if="booking.waitlistPosition" class="text-orange-500"> · Queue #{{ booking.waitlistPosition }}</span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', statusStyle[booking.status] ?? 'bg-slate-100 text-slate-500']">
              {{ booking.status }}
            </span>
            <span v-if="booking.amountDue > 0" :class="['text-xs font-medium px-2 py-0.5 rounded-full', booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700']">
              {{ booking.paymentStatus === 'Paid' ? `Paid ₹${booking.amountPaid}` : `Due ₹${booking.amountDue}` }}
            </span>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-2 font-mono">{{ booking.bookingRef }}</p>
      </div>
    </div>
  </div>
</template>
