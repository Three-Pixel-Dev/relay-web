import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authKeys } from "@/shared/queries/auth.query"
import { workspaceKeys } from "@/shared/queries/workspace.query"
import * as subscriptionService from "@/shared/services/subscription.service"
import { startSubscription as mockStartSubscription } from "@/shared/services/workspace.service"
import { env } from "@/app/config/env"
import type { SubscriptionPlan } from "@/shared/types/relay"
import { useSessionStore } from "@/shared/stores/session.store"

export const subscriptionKeys = {
  plans: ["subscription", "plans"] as const,
  current: ["subscription", "current"] as const,
  history: ["subscription", "history"] as const,
}

export function usePlansQuery() {
  return useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: subscriptionService.listPlans,
    staleTime: 60_000,
  })
}

export function useCurrentSubscriptionQuery(enabled = true) {
  const accessToken = useSessionStore((s) => s.accessToken)
  return useQuery({
    queryKey: subscriptionKeys.current,
    queryFn: subscriptionService.getCurrentSubscription,
    enabled: enabled && Boolean(accessToken),
    retry: false,
  })
}

export function useSubscriptionHistoryQuery(enabled = true) {
  const accessToken = useSessionStore((s) => s.accessToken)
  return useQuery({
    queryKey: subscriptionKeys.history,
    queryFn: subscriptionService.subscriptionHistory,
    enabled: enabled && Boolean(accessToken),
    retry: false,
  })
}

function invalidateBilling(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: subscriptionKeys.current })
  void queryClient.invalidateQueries({ queryKey: subscriptionKeys.history })
  void queryClient.invalidateQueries({ queryKey: authKeys.me })
  void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
}

export function useSubscribeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const token = useSessionStore.getState().accessToken
      if (token) {
        const detail = await subscriptionService.subscribe(plan)
        // Keep mock workspace.sub in sync so product gates still work.
        if (env.useMock) {
          await mockStartSubscription(plan)
        }
        return detail
      }
      return mockStartSubscription(plan)
    },
    onSuccess: () => invalidateBilling(queryClient),
  })
}

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => invalidateBilling(queryClient),
  })
}

export function useResumeSubscriptionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subscriptionService.resumeSubscription,
    onSuccess: () => invalidateBilling(queryClient),
  })
}
