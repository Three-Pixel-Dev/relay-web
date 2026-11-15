export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  meta: unknown
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  userId: number
  email: string
  name: string
  role: string
}

export interface SubscriptionSummary {
  id: number
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export interface MeUser {
  userId: number
  email: string
  name: string
  role: string
  onboardSeen: boolean
  googleLinked: boolean
  avatarUrl: string | null
  currentSessionId: number | null
  createdAt: string
  subscription: SubscriptionSummary | null
}

export interface PlanOption {
  plan: string
  label: string
  durationMonths: number
  priceUsd: number
  trialAvailable: boolean
}

export interface SubscriptionDetail {
  id: number
  createdAt: string
  updatedAt: string
  userId: number
  plan: string
  status: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}
