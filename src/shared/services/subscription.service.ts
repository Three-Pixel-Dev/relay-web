import { apiClient } from "@/app/api/client"
import type { ApiResponse, PlanOption, SubscriptionDetail } from "@/shared/types/api"
import type { SubscriptionPlan } from "@/shared/types/relay"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const { data } = await promise
  if (!data.success) {
    throw Object.assign(new Error(data.message || "Request failed"), { code: data.code })
  }
  return data.data
}

export function toApiPlan(plan: SubscriptionPlan): "SIX_MONTHS" | "YEARLY" {
  return plan === "yearly" ? "YEARLY" : "SIX_MONTHS"
}

export function fromApiPlan(plan: string | null | undefined): SubscriptionPlan | null {
  if (!plan) return null
  if (plan === "YEARLY" || plan === "yearly") return "yearly"
  if (plan === "SIX_MONTHS" || plan === "six_months" || plan === "monthly") return "six_months"
  return null
}

export async function listPlans() {
  return unwrap(apiClient.get<ApiResponse<PlanOption[]>>("/subscription/plans"))
}

export async function getCurrentSubscription() {
  return unwrap(apiClient.get<ApiResponse<SubscriptionDetail>>("/subscription/me"))
}

export async function subscribe(plan: SubscriptionPlan) {
  return unwrap(
    apiClient.post<ApiResponse<SubscriptionDetail>>("/subscription/subscribe", {
      plan: toApiPlan(plan),
    }),
  )
}

export async function cancelSubscription() {
  return unwrap(apiClient.post<ApiResponse<SubscriptionDetail>>("/subscription/cancel"))
}

export async function resumeSubscription() {
  return unwrap(apiClient.post<ApiResponse<SubscriptionDetail>>("/subscription/resume"))
}

export async function subscriptionHistory() {
  return unwrap(apiClient.get<ApiResponse<SubscriptionDetail[]>>("/subscription/history"))
}
