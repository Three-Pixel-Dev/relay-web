import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addFromScout,
  addOwnList,
  buildForPartner,
  getPartnersOverview,
  removePartner,
  scoutCreators,
  sendOutreach,
  updateOutreach,
  updatePartnerStatus,
} from "@/shared/services/partners.service"
import type { OutreachTemplate, ScoutResult } from "@/shared/types/relay"
import { productKeys } from "@/shared/queries/product.query"

export const partnersKeys = {
  all: ["partners"] as const,
  overview: () => [...partnersKeys.all, "overview"] as const,
}

export function usePartnersOverviewQuery() {
  return useQuery({
    queryKey: partnersKeys.overview(),
    queryFn: getPartnersOverview,
    refetchInterval: 30_000,
  })
}

export function useScoutMutation() {
  return useMutation({
    mutationFn: ({ query, platforms }: { query: string; platforms: string[] }) =>
      scoutCreators(query, platforms),
  })
}

export function useAddFromScoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (creators: ScoutResult[]) => addFromScout(creators),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
    },
  })
}

export function useAddOwnListMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => addOwnList(text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
    },
  })
}

export function useRemovePartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removePartner(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
    },
  })
}

export function useUpdateOutreachMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<OutreachTemplate>) => updateOutreach(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(partnersKeys.overview(), data)
    },
  })
}

export function useSendOutreachMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sendOutreach(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
    },
  })
}

export function useUpdatePartnerStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "interested" | "declined" }) =>
      updatePartnerStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
    },
  })
}

export function useBuildForPartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => buildForPartner(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnersKeys.overview() })
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
