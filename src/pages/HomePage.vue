<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { Booking, Facility } from '@/types'
import AppIcon from '@/components/ui/AppIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const upcomingBookings = ref<Booking[]>([])
const facilities = ref<Facility[]>([])
const allBookings = ref<Booking[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [bookingsRes, facilitiesRes, allRes] = await Promise.all([
      api.get('/member/bookings', { params: { status: 'Confirmed', limit: 3 } }),
      api.get('/member/facilities', { params: { limit: 4 } }),
      api.get('/member/bookings', { params: { limit: 100 } }),
    ])
    upcomingBookings.value = bookingsRes.data.data?.items ?? []
    facilities.value = facilitiesRes.data.data ?? []
    allBookings.value = allRes.data.data?.items ?? []
  } finally {
    loading.value = false
  }
})

const now = new Date()

const thisMonthBookings = computed(() =>
  allBookings.value.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
)

const monthStats = computed(() => ({
  total: thisMonthBookings.value.length,
  confirmed: thisMonthBookings.value.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length,
  amountPaid: thisMonthBookings.value
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.amountPaid ?? 0), 0),
}))

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
      <p class="text-indigo-200 text-sm">Good day,</p>
      <h1 class="text-xl font-bold">{{ auth.user?.name }}</h1>
      <p class="text-indigo-200 text-sm mt-0.5">Unit {{ auth.user?.unit }} · {{ auth.user?.membershipId }}</p>

      <div class="flex gap-6 mt-4 pt-4 border-t border-indigo-500/30">
        <div>
          <p class="text-lg font-bold text-white">{{ monthStats.total }}</p>
          <p class="text-xs text-indigo-300">Bookings this month</p>
        </div>
        <div>
          <p class="text-lg font-bold text-white">{{ monthStats.confirmed }}</p>
          <p class="text-xs text-indigo-300">Confirmed</p>
        </div>
        <div v-if="monthStats.amountPaid > 0">
          <p class="text-lg font-bold text-white">₹{{ monthStats.amountPaid.toLocaleString('en-IN') }}</p>
          <p class="text-xs text-indigo-300">Paid this month</p>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div>
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div class="grid grid-cols-3 gap-3">
        <button
          class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-indigo-300 hover:shadow-sm transition-all"
          @click="router.push('/facilities')"
        >
          <span class="text-indigo-500"><AppIcon name="building-office" size="lg" /></span>
          <span class="text-xs text-slate-600 font-medium text-center">Book Facility</span>
        </button>
        <button
          class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-indigo-300 hover:shadow-sm transition-all"
          @click="router.push('/bookings')"
        >
          <span class="text-indigo-500"><AppIcon name="calendar" size="lg" /></span>
          <span class="text-xs text-slate-600 font-medium text-center">My Bookings</span>
        </button>
        <button
          class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-indigo-300 hover:shadow-sm transition-all"
          @click="router.push('/notifications')"
        >
          <span class="text-indigo-500"><AppIcon name="bell" size="lg" /></span>
          <span class="text-xs text-slate-600 font-medium text-center">Notifications</span>
        </button>
      </div>
    </div>

    <!-- Upcoming bookings -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming Bookings</h2>
        <button class="text-xs text-indigo-600 font-medium" @click="router.push('/bookings')">View all →</button>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 2" :key="i" class="h-16 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="upcomingBookings.length === 0" class="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
        No upcoming bookings. <RouterLink to="/facilities" class="text-indigo-600 font-medium">Book a facility →</RouterLink>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="booking in upcomingBookings"
          :key="booking.id"
          class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-300 cursor-pointer transition-all"
          @click="router.push(`/bookings/${booking.id}`)"
        >
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
            <AppIcon name="building-office" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 truncate">{{ booking.facilityName }}</p>
            <p class="text-xs text-slate-400">{{ formatDate(booking.date) }} · {{ booking.slots[0]?.startTime }}–{{ booking.slots[booking.slots.length - 1]?.endTime }}</p>
          </div>
          <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', booking.status === 'Waitlisted' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600']">
            {{ booking.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Available facilities -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Facilities</h2>
        <button class="text-xs text-indigo-600 font-medium" @click="router.push('/facilities')">View all →</button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="f in facilities"
          :key="f.id"
          class="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 cursor-pointer transition-all"
          @click="router.push(`/facilities/${f.id}`)"
        >
          <p class="font-medium text-slate-900 text-sm">{{ f.name }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ f.category }}</p>
          <p class="text-xs text-indigo-600 font-medium mt-2">
            {{ f.pricing.isPaid ? `₹${f.pricing.chargePerSlot}/slot` : 'Free' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
