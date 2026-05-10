import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginPage = () => import('@/pages/LoginPage.vue')
const SelectCommunityPage = () => import('@/pages/SelectCommunityPage.vue')
const ChangePasswordPage = () => import('@/pages/ChangePasswordPage.vue')
const AppLayout = () => import('@/layouts/AppLayout.vue')
const HomePage = () => import('@/pages/HomePage.vue')
const FacilitiesPage = () => import('@/pages/FacilitiesPage.vue')
const FacilityDetailPage = () => import('@/pages/FacilityDetailPage.vue')
const BookingsPage = () => import('@/pages/BookingsPage.vue')
const BookingDetailPage = () => import('@/pages/BookingDetailPage.vue')
const NotificationsPage = () => import('@/pages/NotificationsPage.vue')
const ProfilePage = () => import('@/pages/ProfilePage.vue')
const DiscoverPage = () => import('@/pages/DiscoverPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { public: true } },
    { path: '/select-community', component: SelectCommunityPage, meta: { public: true } },
    { path: '/change-password', component: ChangePasswordPage, meta: { requiresAuth: true } },
    { path: '/discover', component: DiscoverPage, meta: { public: true } },

    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/home' },
        { path: 'home', component: HomePage },
        { path: 'facilities', component: FacilitiesPage },
        { path: 'facilities/:id', component: FacilityDetailPage },
        { path: 'bookings', component: BookingsPage },
        { path: 'bookings/:id', component: BookingDetailPage },
        { path: 'notifications', component: NotificationsPage },
        { path: 'profile', component: ProfilePage },
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.public) {
    if (!auth.restoreFromStorage()) return '/login'
    if (!auth.user) {
      await auth.fetchProfile().catch(() => {})
      if (!auth.user) return '/login'
    }
    if (auth.needsPasswordChange && to.path !== '/change-password') {
      return '/change-password'
    }
  }
})
