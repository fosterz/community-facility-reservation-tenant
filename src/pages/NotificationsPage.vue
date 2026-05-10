<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import type { Notification } from '@/types'

const notifications = ref<Notification[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/member/notifications')
    notifications.value = data.data
  } finally {
    loading.value = false
  }
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const typeIcon: Record<string, string> = {
  booking: '📅', payment: '💳', announcement: '📣', waitlist: '⏳', system: '🔔'
}
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 mb-4">Notifications</h1>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 bg-slate-100 rounded-xl animate-pulse" />
    </div>
    <div v-else-if="notifications.length === 0" class="text-center py-12 text-slate-400 text-sm">
      No notifications yet.
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['bg-white border rounded-xl p-4', n.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/30']"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl flex-shrink-0 mt-0.5">{{ typeIcon[n.type] ?? '🔔' }}</span>
          <div class="flex-1 min-w-0">
            <p :class="['text-sm', n.isRead ? 'text-slate-700' : 'font-semibold text-slate-900']">{{ n.title }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ n.body }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ formatDate(n.createdAt) }}</p>
          </div>
          <div v-if="!n.isRead" class="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2" />
        </div>
      </div>
    </div>
  </div>
</template>
