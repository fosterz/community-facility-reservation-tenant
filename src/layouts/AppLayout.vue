<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const navItems = [
  { label: 'Home', path: '/home', icon: '🏠' },
  { label: 'Facilities', path: '/facilities', icon: '🏢' },
  { label: 'Bookings', path: '/bookings', icon: '📅' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'Profile', path: '/profile', icon: '👤' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div>
          <p class="font-semibold text-slate-900 text-sm">{{ auth.user?.communityName }}</p>
          <p class="text-xs text-slate-400">{{ auth.user?.name }} · Unit {{ auth.user?.unit }}</p>
        </div>
        <button class="text-slate-400 hover:text-red-500 transition-colors text-sm" @click="logout">
          Sign Out
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 max-w-lg mx-auto w-full px-4 py-6">
      <RouterView />
    </main>

    <!-- Bottom nav -->
    <nav class="bg-white border-t border-slate-200 sticky bottom-0 z-30">
      <div class="max-w-lg mx-auto px-2 flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
            $route.path.startsWith(item.path)
              ? 'text-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          ]"
        >
          <span class="text-xl leading-none">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
