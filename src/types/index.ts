export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface AuthUser {
  id: string
  name: string
  // community_admin / staff fields
  role?: 'community_admin' | 'staff'
  email?: string
  tenantId?: string
  tenantName?: string
  // member fields
  membershipId?: string
  mobile?: string
  unit?: string
  communityName?: string
  forcePasswordChange?: boolean
}

export interface Community {
  id: string
  name: string
  slug: string
  city: string
  state: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
}

// --- Member-facing ---

export interface Facility {
  id: string
  name: string
  category: string
  description?: string
  capacity: number
  status: 'Active' | 'Maintenance' | 'Closed'
  imageUrl?: string
  pricing: {
    isPaid: boolean
    chargePerSlot: number
    peakHourSurcharge: number
    refundPolicy: string
  }
  bookingConfig: {
    slotDurationMinutes: number
    advanceBookingDays: number
    cancellationCutoffHours: number
    maxSlotsPerBooking: number
  }
  waitlistConfig: {
    enabled: boolean
    maxPerSlot: number
    autoPromote: boolean
  }
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  waitlistCount?: number
}

export interface Booking {
  id: string
  bookingRef: string
  facilityId: string
  facilityName: string
  date: string
  slots: { startTime: string; endTime: string }[]
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' | 'Waitlisted'
  paymentStatus: 'Free' | 'Pending' | 'Paid'
  amountDue: number
  amountPaid?: number
  waitlistPosition?: number
  // admin view extras
  memberId?: string
  memberName?: string
  memberUnit?: string
  createdAt?: string
}

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface MemberProfile {
  id: string
  membershipId: string
  name: string
  mobile: string
  email?: string
  unit: string
  profilePhoto?: string
  forcePasswordChange: boolean
}

// --- Community admin-facing ---

export interface Member {
  id: string
  membershipId: string
  name: string
  mobile: string
  email?: string
  unit: string
  status: 'Active' | 'Suspended' | 'Pending'
  forcePasswordChange: boolean
  profilePhoto?: string
  createdAt: string
}

export interface Admin {
  id: string
  name: string
  email: string
  role: 'CommunityAdmin' | 'Staff'
  isActive: boolean
  createdAt: string
}

export interface AdminBooking {
  id: string
  bookingRef: string
  memberId: string
  memberName: string
  memberUnit: string
  facilityId: string
  facilityName: string
  date: string
  slots: { startTime: string; endTime: string }[]
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' | 'Waitlisted'
  paymentStatus: 'Free' | 'Pending' | 'Paid'
  amountDue: number
  amountPaid?: number
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNo: string
  bookingId: string
  bookingRef: string
  memberName: string
  memberUnit: string
  facilityName: string
  subtotal: number
  taxPercent: number
  taxAmount: number
  total: number
  paymentStatus: string
  paidAt: string
  createdAt: string
}

export interface JoinRequest {
  id: string
  tenantId: string
  tenantName: string
  applicantName: string
  applicantMobile: string
  unitNumber: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  sentAt: string
  sentBy: string
  recipientCount: number
}

export interface TenantSettings {
  communityProfile: {
    description: string
    logoUrl?: string
    bannerUrl?: string
    website?: string
  }
  documentPrefixes: {
    membershipId: string
    bookingRef: string
    invoiceNo: string
    receiptNo: string
  }
  invoiceSettings: {
    taxPercent: number
    footerNote: string
  }
  bookingPolicies: {
    requireApproval: boolean
    allowGuestBooking: boolean
    guestFeePercent: number
  }
}
