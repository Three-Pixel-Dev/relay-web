import { getCatalog as getStaticCatalog } from "@/shared/catalog/relay-catalog"
import type { RelayCatalog } from "@/shared/types/relay"

export async function getCatalog(): Promise<RelayCatalog> {
  return getStaticCatalog()
}
