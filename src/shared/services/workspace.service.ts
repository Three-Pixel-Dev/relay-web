import { apiClient } from "@/app/api/client"
import type { Workspace } from "@/shared/types/relay"

export async function getWorkspace() {
  const { data } = await apiClient.get<Workspace>("/workspace")
  return data
}

export async function markOnboarded() {
  const { data } = await apiClient.post<Workspace>("/workspace/onboard")
  return data
}

export async function connectService(id: string, label: string, credential?: string) {
  const { data } = await apiClient.post<Workspace>(`/workspace/services/${id}/connect`, {
    label,
    credential,
  })
  return data
}

export async function disconnectService(id: string) {
  const { data } = await apiClient.delete<Workspace>(`/workspace/services/${id}`)
  return data
}
