import { apiClient } from "@/app/api/client"
import type { RelayCatalog } from "@/shared/types/relay"

export async function getCatalog() {
  const { data } = await apiClient.get<RelayCatalog>("/catalog")
  return data
}
