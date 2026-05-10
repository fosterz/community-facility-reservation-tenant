<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/lib/api'
import type { Facility, TimeSlot } from '@/types'

const route = useRoute()
const router = useRouter()
const facility = ref<Facility | null>(null)
const slots = ref<TimeSlot[]>([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSlots = ref<string[]>([])
const loading = ref(true)
const slotsLoading = ref(false)
const booking = ref(false)
const bookingError = ref('')
const bookingSuccess = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get(`/member/facilities/${route.params.id}`)
    facility.value = data.data
    await fetchSlots()
  } finally {
    loading.value = false
  }
})

async function fetchSlots() {
  slotsLoading.value = true
  try {
    const { data } = await api.get(`/member/facilities/${route.params.id}/availability`, {
      params: { date: selectedDate.value }
    })
    slots.value = data.data
    selectedSlots.value = []
  } finally {
    slotsLoading.value = false
  }
}

function toggleSlot(startTime: string) {
  const idx = selectedSlots.value.indexOf(startTime)
  if (idx >= 0) {
    selectedSlots.value.splice(idx, 1)
  } else {
    if (facility.value && selectedSlots.value.length >= facility.value.bookingConfig.maxSlotsPerBooking) return
    selectedSlots.value.push(startTime)
  }
}

const totalAmount = computed(() => {
  if (!facility.value?.pricing.isPaid) return 0
  return selectedSlots.value.length * facility.value.pricing.chargePerSlot
})

async function confirmBooking() {
  bookingError.value = ''
  booking.value = true
  try {
    await api.post('/member/bookings', {
      facilityId: route.params.id,
      date: selectedDate.value,
      slotStartTimes: selectedSlots.value,
    })
    bookingSuccess.value = true
    setTimeout(() => router.push('/bookings'), 2000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    bookingError.value = e.response?.data?.message ?? 'Failed to create booking.'
  } finally {
    booking.value = false
  }
}

// Advance date selector options
const dateOptions = computed(() => {
  const days = facility.value?.bookingConfig.advanceBookingDays ?? 7
  const opts = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    opts.push(d.toISOString().split('T')[0])
  }
  return opts
})

function formatDateLabel(d: string) {
  const date = new Date(d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = (date.getTime() - today.getTime()) / 86400000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div>
    <button class="flex items-center gap-1 text-slate-500 text-sm mb-4 hover:text-slate-700" @click="router.back()">
      ← Back
    </button>

    <div v-if="loading" class="space-y-4">
      <div class="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      <div class="h-20 bg-slate-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="facility">
      <!-- Facility header -->
      <div class="bg-gradient-to-br from-indigo-100 to-slate-100 rounded-2xl h-36 flex items-center justify-center text-5xl mb-4">
        🏢
      </div>
      <h1 class="text-xl font-bold text-slate-900">{{ facility.name }}</h1>
      <p class="text-sm text-slate-500">{{ facility.category }} · Capacity {{ facility.capacity }}</p>
      <div class="flex gap-3 mt-2 text-sm">
        <span class="text-indigo-600 font-medium">{{ facility.pricing.isPaid ? `₹${facility.pricing.chargePerSlot}/slot` : 'Free' }}</span>
        <span class="text-slate-300">·</span>
        <span class="text-slate-500">{{ facility.bookingConfig.slotDurationMinutes }}min slots</span>
      </div>
      <p v-if="facility.description" class="text-sm text-slate-500 mt-2">{{ facility.description }}</p>

      <!-- Booking success -->
      <div v-if="bookingSuccess" class="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <p class="text-3xl mb-2">✅</p>
        <p class="font-semibold text-emerald-700">Booking Confirmed!</p>
        <p class="text-sm text-emerald-600">Redirecting to your bookings...</p>
      </div>

      <template v-else>
        <!-- Date picker -->
        <div class="mt-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Date</p>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              v-for="d in dateOptions"
              :key="d"
              :class="[
                'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                selectedDate === d
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              ]"
              @click="selectedDate = d; fetchSlots()"
            >
              {{ formatDateLabel(d) }}
            </button>
          </div>
        </div>

        <!-- Time slots -->
        <div class="mt-4">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Available Slots
            <span v-if="selectedSlots.length > 0" class="text-indigo-600">({{ selectedSlots.length }} selected)</span>
          </p>

          <div v-if="slotsLoading" class="grid grid-cols-3 gap-2">
            <div v-for="i in 6" :key="i" class="h-10 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in slots"
              :key="slot.startTime"
              :disabled="!slot.available && !selectedSlots.includes(slot.startTime)"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-medium border transition-all',
                selectedSlots.includes(slot.startTime)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : slot.available
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    : 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed line-through'
              ]"
              @click="slot.available && toggleSlot(slot.startTime)"
            >
              {{ slot.startTime }}
              <span v-if="!slot.available && facility.waitlistConfig.enabled" class="block text-slate-400" style="font-size: 9px;">Waitlist</span>
            </button>
          </div>
        </div>

        <!-- Summary & confirm -->
        <div v-if="selectedSlots.length > 0" class="mt-6 bg-white border border-slate-200 rounded-xl p-4">
          <div class="flex justify-between text-sm mb-3">
            <span class="text-slate-500">{{ selectedSlots.length }} slot{{ selectedSlots.length > 1 ? 's' : '' }} × {{ facility.bookingConfig.slotDurationMinutes }}min</span>
            <span class="font-semibold">{{ totalAmount > 0 ? `₹${totalAmount}` : 'Free' }}</span>
          </div>
          <div v-if="bookingError" class="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
            {{ bookingError }}
          </div>
          <button
            :disabled="booking"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            @click="confirmBooking"
          >
            <span v-if="booking" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ totalAmount > 0 ? `Book Now · ₹${totalAmount}` : 'Book Now (Free)' }}
          </button>
          <p v-if="totalAmount > 0" class="text-xs text-slate-400 text-center mt-2">
            Payment collected at the facility desk.
          </p>
        </div>
      </template>
    </template>
  </div>
</template>
