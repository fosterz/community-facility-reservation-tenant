<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Booking } from '@/types'

const route = useRoute()
const router = useRouter()
const booking = ref<Booking | null>(null)
const loading = ref(true)
const cancelling = ref(false)
const cancelError = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get(`/member/bookings/${route.params.id}`)
    booking.value = data.data
  } finally {
    loading.value = false
  }
})

async function cancelBooking() {
  if (!booking.value || !confirm('Are you sure you want to cancel this booking?')) return
  cancelling.value = true
  cancelError.value = ''
  try {
    await api.post(`/member/bookings/${booking.value.id}/cancel`)
    booking.value.status = 'Cancelled'
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    cancelError.value = e.response?.data?.message ?? 'Could not cancel booking.'
  } finally {
    cancelling.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
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
    <button class="flex items-center gap-1 text-slate-500 text-sm mb-4" @click="router.back()">← Back</button>

    <div v-if="loading" class="space-y-4">
      <div class="h-32 bg-slate-100 rounded-2xl animate-pulse" />
    </div>

    <template v-else-if="booking">
      <!-- Header -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h1 class="text-lg font-bold text-slate-900">{{ booking.facilityName }}</h1>
            <p class="text-sm text-slate-500 mt-0.5">{{ formatDate(booking.date) }}</p>
          </div>
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', statusStyle[booking.status] ?? 'bg-slate-100 text-slate-500']">
            {{ booking.status }}
          </span>
        </div>

        <div class="text-xs text-slate-400 font-mono mb-3">{{ booking.bookingRef }}</div>

        <!-- Slots -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="slot in booking.slots"
            :key="slot.startTime"
            class="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full"
          >
            {{ slot.startTime }} – {{ slot.endTime }}
          </span>
        </div>
      </div>

      <!-- Payment info -->
      <div v-if="booking.amountDue > 0" class="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment</p>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Amount Due</span>
          <span class="font-semibold">₹{{ booking.amountDue }}</span>
        </div>
        <div v-if="booking.paymentStatus === 'Paid'" class="flex justify-between text-sm mt-2">
          <span class="text-slate-500">Amount Paid</span>
          <span class="font-semibold text-emerald-600">₹{{ booking.amountPaid }}</span>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700']">
            {{ booking.paymentStatus }}
          </span>
          <span v-if="booking.paymentStatus === 'Pending'" class="text-xs text-slate-400">
            Please pay at the facility desk before your booking time.
          </span>
        </div>
      </div>

      <!-- Waitlist info -->
      <div v-if="booking.status === 'Waitlisted' && booking.waitlistPosition" class="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
        <p class="font-semibold text-orange-700">You're on the waitlist</p>
        <p class="text-sm text-orange-600 mt-1">Position #{{ booking.waitlistPosition }}. You'll be notified via SMS if a slot opens up.</p>
      </div>

      <!-- Cancel -->
      <div v-if="['Confirmed', 'Waitlisted'].includes(booking.status)" class="mt-2">
        <div v-if="cancelError" class="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
          {{ cancelError }}
        </div>
        <button
          :disabled="cancelling"
          class="w-full border border-red-200 text-red-600 hover:bg-red-50 font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          @click="cancelBooking"
        >
          <span v-if="cancelling" class="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          Cancel Booking
        </button>
        <p class="text-xs text-slate-400 text-center mt-2">
          Cancellation cutoff applies based on facility policy.
        </p>
      </div>
    </template>
  </div>
</template>
