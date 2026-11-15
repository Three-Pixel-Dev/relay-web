import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useCurrentSubscriptionQuery, useSubscribeMutation } from "@/shared/queries/subscription.query"
import { fromApiPlan } from "@/shared/services/subscription.service"
import {
  connectService,
  disconnectService,
  getWorkspace,
  markOnboarded,
} from "@/shared/services/workspace.service"
import { useSessionStore } from "@/shared/stores/session.store"
import type { Workspace } from "@/shared/types/relay"

export const workspaceKeys = {
  all: ["workspace"] as const,
}

export function useWorkspaceQuery() {
  const accessToken = useSessionStore((s) => s.accessToken)
  const liveSub = useCurrentSubscriptionQuery(Boolean(accessToken))
  const query = useQuery({
    queryKey: workspaceKeys.all,
    queryFn: getWorkspace,
  })

  const data = useMemo((): Workspace | undefined => {
    if (!query.data) return undefined
    if (!accessToken) return query.data
    if (liveSub.isLoading) return query.data
    const plan = fromApiPlan(liveSub.data?.plan)
    return { ...query.data, sub: plan }
  }, [query.data, accessToken, liveSub.isLoading, liveSub.data?.plan])

  return {
    ...query,
    data,
    isLoading: query.isLoading || (Boolean(accessToken) && liveSub.isLoading),
  }
}

/** Prefer live billing when authenticated; falls back to mock workspace subscription. */
export function useStartSubscriptionMutation() {
  return useSubscribeMutation()
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
