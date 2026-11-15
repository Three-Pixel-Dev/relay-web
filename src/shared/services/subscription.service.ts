import { apiClient } from "@/app/api/client"
import type { PlanOption, SubscriptionDetail } from "@/shared/types/api"
import type { SubscriptionPlan } from "@/shared/types/relay"

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
  const { data } = await apiClient.get<PlanOption[]>("/subscription/plans")
  return data
}

export async function getCurrentSubscription() {
  const { data } = await apiClient.get<SubscriptionDetail>("/subscription/me")
  return data
}

export async function subscribe(plan: SubscriptionPlan) {
  const { data } = await apiClient.post<SubscriptionDetail>("/subscription/subscribe", {
    plan: toApiPlan(plan),
  })
  return data
}

export async function cancelSubscription() {
  const { data } = await apiClient.post<SubscriptionDetail>("/subscription/cancel")
  return data
}

export async function resumeSubscription() {
  const { data } = await apiClient.post<SubscriptionDetail>("/subscription/resume")
  return data
}

export async function subscriptionHistory() {
  const { data } = await apiClient.get<SubscriptionDetail[]>("/subscription/history")
  return data
}
