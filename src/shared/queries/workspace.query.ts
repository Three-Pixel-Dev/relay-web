import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  connectService,
  disconnectService,
  getWorkspace,
  markOnboarded,
  startSubscription,
} from "@/shared/services/workspace.service"
import type { SubscriptionPlan } from "@/shared/types/relay"

export const workspaceKeys = {
  all: ["workspace"] as const,
}

export function useWorkspaceQuery() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: getWorkspace,
  })
}

export function useStartSubscriptionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => startSubscription(plan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

export function useMarkOnboardedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markOnboarded,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

export function useConnectServiceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => connectService(id, label),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

export function useDisconnectServiceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disconnectService(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}
