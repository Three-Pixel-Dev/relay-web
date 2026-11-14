import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { productKeys } from "@/shared/queries/product.query"
import {
  addFromScout,
  addOwnList,
  buildPartnerProduct,
  getOutreach,
  listPartners,
  listScout,
  markPartnerStatus,
  removePartner,
  scoutCreators,
  sendPartnerOutreach,
  updateOutreach,
} from "@/shared/services/partner.service"
import type { BuildMode, OutreachTemplate, PartnerPlatform, PartnerStatus } from "@/shared/types/relay"

export const partnerKeys = {
  all: ["partners"] as const,
  list: () => [...partnerKeys.all, "list"] as const,
  scout: () => [...partnerKeys.all, "scout"] as const,
  outreach: () => [...partnerKeys.all, "outreach"] as const,
}

export function usePartnersQuery() {
  return useQuery({
    queryKey: partnerKeys.list(),
    queryFn: listPartners,
    refetchInterval: 2000,
  })
}

export function useScoutQuery() {
  return useQuery({
    queryKey: partnerKeys.scout(),
    queryFn: listScout,
  })
}

export function useOutreachQuery() {
  return useQuery({
    queryKey: partnerKeys.outreach(),
    queryFn: getOutreach,
  })
}

export function useUpdateOutreachMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<OutreachTemplate>) => updateOutreach(patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.outreach() })
    },
  })
}

export function useScoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ query, platforms }: { query: string; platforms: PartnerPlatform[] }) =>
      scoutCreators(query, platforms),
    onSuccess: (results) => {
      queryClient.setQueryData(partnerKeys.scout(), results)
    },
  })
}

export function useAddFromScoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (handles: string[]) => addFromScout(handles),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
    },
  })
}

export function useAddOwnListMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lines: string) => addOwnList(lines),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.list() })
    },
  })
}

export function useSendOutreachMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendPartnerOutreach,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.list() })
    },
  })
}

export function useRemovePartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removePartner(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.list() })
    },
  })
}

export function useMarkPartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: Extract<PartnerStatus, "interested" | "declined">
    }) => markPartnerStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.list() })
    },
  })
}

export function useBuildPartnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: BuildMode }) =>
      buildPartnerProduct(id, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: partnerKeys.all })
      void queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
