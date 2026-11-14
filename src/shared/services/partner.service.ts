import { apiClient } from "@/app/api/client"
import type {
  BuildMode,
  OutreachTemplate,
  Partner,
  PartnerPlatform,
  PartnerStatus,
  Product,
  ScoutResult,
} from "@/shared/types/relay"

export async function listPartners() {
  const { data } = await apiClient.get<Partner[]>("/partners")
  return data
}

export async function listScout() {
  const { data } = await apiClient.get<ScoutResult[]>("/partners/scout")
  return data
}

export async function getOutreach() {
  const { data } = await apiClient.get<OutreachTemplate>("/partners/outreach")
  return data
}

export async function updateOutreach(patch: Partial<OutreachTemplate>) {
  const { data } = await apiClient.patch<OutreachTemplate>("/partners/outreach", patch)
  return data
}

export async function scoutCreators(query: string, platforms: PartnerPlatform[]) {
  const { data } = await apiClient.post<ScoutResult[]>("/partners/scout", {
    query,
    platforms,
  })
  return data
}

export async function addFromScout(handles: string[]) {
  const { data } = await apiClient.post<Partner[]>("/partners/from-scout", { handles })
  return data
}

export async function addOwnList(lines: string) {
  const { data } = await apiClient.post<{ count: number; partners: Partner[] }>(
    "/partners/own-list",
    { lines }
  )
  return data
}

export async function sendPartnerOutreach() {
  const { data } = await apiClient.post<{ sent: number; partners: Partner[] }>("/partners/send")
  return data
}

export async function removePartner(id: string) {
  const { data } = await apiClient.delete<Partner[]>(`/partners/${id}`)
  return data
}

export async function markPartnerStatus(id: string, status: Extract<PartnerStatus, "interested" | "declined">) {
  const { data } = await apiClient.post<Partner[]>(`/partners/${id}/status`, { status })
  return data
}

export async function buildPartnerProduct(id: string, mode: BuildMode) {
  const { data } = await apiClient.post<{ product: Product; partners: Partner[] }>(
    `/partners/${id}/build`,
    { mode }
  )
  return data
}
