import { useQuery } from "@tanstack/react-query"

import { getAdminStats } from "@/shared/services/admin.service"

export const adminKeys = {
  stats: ["admin", "stats"] as const,
}

export function useAdminStatsQuery(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: getAdminStats,
    enabled,
  })
}
