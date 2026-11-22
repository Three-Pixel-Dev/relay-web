import { apiClient } from "@/app/api/client"
import type {
  OutreachTemplate,
  Partner,
  Product,
  ScoutResult,
} from "@/shared/types/relay"

export interface PartnersOverview {
  partners: Partner[]
  outreach: OutreachTemplate
  mailConfigured: boolean
  mailFrom: string
}

export interface SendOutreachResult {
  sent: number
  skippedSuppressed: number
  remainingQueued: number
  partners: Partner[]
}

export async function getPartnersOverview() {
  const { data } = await apiClient.get<PartnersOverview>("/partners")
  return data
}

export async function scoutCreators(query: string, platforms: string[]) {
  const { data } = await apiClient.post<ScoutResult[]>("/partners/scout", {
    query,
    platforms,
  })
  return data
}

export async function addFromScout(creators: ScoutResult[]) {
  const { data } = await apiClient.post<Partner[]>("/partners/from-scout", {
    creators,
  })
  return data
}

export async function addOwnList(text: string) {
  const { data } = await apiClient.post<Partner[]>("/partners/own-list", { text })
  return data
}

export async function removePartner(id: string) {
  const { data } = await apiClient.delete<Partner[]>(`/partners/${id}`)
  return data
}

export async function updateOutreach(patch: Partial<OutreachTemplate>) {
  const { data } = await apiClient.put<PartnersOverview>("/partners/outreach", patch)
  return data
}

export async function sendOutreach() {
  const { data } = await apiClient.post<SendOutreachResult>("/partners/send")
  return data
}

export async function updatePartnerStatus(id: string, status: "interested" | "declined") {
  const { data } = await apiClient.put<Partner>(`/partners/${id}/status`, { status })
  return data
}

export async function buildForPartner(id: string, mode?: string) {
  const { data } = await apiClient.post<Product>(`/partners/${id}/build`, { mode })
  return data
}
