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

// Community admin / staff pages
const CommunityLayout = () => import('@/layouts/CommunityLayout.vue')
const CommunityDashboard = () => import('@/pages/community/DashboardPage.vue')
const MembersPage = () => import('@/pages/community/MembersPage.vue')
const MemberDetailPage = () => import('@/pages/community/MemberDetailPage.vue')
const CommunityFacilitiesPage = () => import('@/pages/community/FacilitiesPage.vue')
const CommunityFacilityDetailPage = () => import('@/pages/community/FacilityDetailPage.vue')
const CommunityBookingsPage = () => import('@/pages/community/BookingsPage.vue')
const CommunityBookingDetailPage = () => import('@/pages/community/BookingDetailPage.vue')
const InvoicesPage = () => import('@/pages/community/InvoicesPage.vue')
const AnnouncementsPage = () => import('@/pages/community/AnnouncementsPage.vue')
const JoinRequestsPage = () => import('@/pages/community/JoinRequestsPage.vue')
const StaffPage = () => import('@/pages/community/StaffPage.vue')
const ReportsPage = () => import('@/pages/community/ReportsPage.vue')
const SettingsPage = () => import('@/pages/community/SettingsPage.vue')
const BuildingsPage = () => import('@/pages/community/BuildingsPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { public: true } },
    { path: '/select-community', component: SelectCommunityPage, meta: { public: true } },
    { path: '/discover', component: DiscoverPage, meta: { public: true } },

    // Member routes
    { path: '/change-password', component: ChangePasswordPage, meta: { requiresAuth: true, requiresMember: true } },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true, requiresMember: true },
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

    // Community admin / staff routes
    {
      path: '/community',
      component: CommunityLayout,
      meta: { requiresAuth: true, requiresCommunity: true },
      children: [
        { path: '', redirect: '/community/dashboard' },
        { path: 'dashboard', component: CommunityDashboard },
        { path: 'members', component: MembersPage },
        { path: 'members/:id', component: MemberDetailPage },
        { path: 'facilities', component: CommunityFacilitiesPage },
        { path: 'facilities/:id', component: CommunityFacilityDetailPage },
        { path: 'bookings', component: CommunityBookingsPage },
        { path: 'bookings/:id', component: CommunityBookingDetailPage },
        { path: 'invoices', component: InvoicesPage },
        { path: 'announcements', component: AnnouncementsPage },
        { path: 'join-requests', component: JoinRequestsPage },
        { path: 'staff', component: StaffPage },
        { path: 'reports', component: ReportsPage },
        { path: 'buildings', component: BuildingsPage },
        { path: 'settings', component: SettingsPage },
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

    if (to.meta.requiresCommunity && !auth.isCommunityUser) return '/home'
    if (to.meta.requiresMember && auth.isCommunityUser) return '/community/dashboard'

    if (!auth.isCommunityUser && auth.needsPasswordChange && to.path !== '/change-password') {
      return '/change-password'
    }
  }
})
