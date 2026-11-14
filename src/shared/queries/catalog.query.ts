import { useQuery } from "@tanstack/react-query"

import { getCatalog } from "@/shared/services/catalog.service"

export const catalogKeys = {
  all: ["catalog"] as const,
}

export function useCatalogQuery() {
  return useQuery({
    queryKey: catalogKeys.all,
    queryFn: getCatalog,
    staleTime: Infinity,
  })
}
