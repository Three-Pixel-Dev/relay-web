import { apiClient } from "@/app/api/client"
import type { AdminStats } from "@/shared/types/relay"

export async function getAdminStats() {
  const { data } = await apiClient.get<AdminStats>("/admin/stats")
  return data
}
