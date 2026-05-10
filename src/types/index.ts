export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface AuthUser {
  id: string
  membershipId: string
  name: string
  mobile: string
  unit: string
  tenantId: string
  communityName: string
  forcePasswordChange: boolean
}

export interface Community {
  id: string
  name: string
  slug: string
  city: string
  state: string
}

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
  createdAt: string
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
