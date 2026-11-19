export function money(value: number) {
  const amount = Number(value || 0)
  return `$${amount.toFixed(amount % 1 ? 2 : 0)}`
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export function pagesCount(words: number, sections: number) {
  return Math.max(4, Math.round(words / 320) + sections + 2)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  const n = Number(count) || 0
  return `${n.toLocaleString()} ${n === 1 ? singular : plural}`
}

export function productName(
  product?: {
    name?: string | null
    brand?: { title?: string | null } | null
    input?: string | null
    profile?: { niche?: string | null } | null
    pocket?: { niche?: string | null } | null
  } | null
) {
  if (!product) return "Untitled product"
  return (
    product.name?.trim() ||
    product.brand?.title?.trim() ||
    product.input?.trim() ||
    product.profile?.niche?.trim() ||
    product.pocket?.niche?.trim() ||
    "Untitled product"
  )
}
