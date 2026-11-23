import type { Palette, ProductBrand } from "@/shared/types/relay"

const loadedFonts = new Set<string>(["sora"])

export function resolveBrandPalette(
  brand: ProductBrand | null | undefined,
  catalogPalettes?: Palette[]
): Palette | null {
  if (brand?.paletteDetail && Array.isArray(brand.paletteDetail.cols) && brand.paletteDetail.cols.length >= 5) {
    return brand.paletteDetail
  }
  if (!catalogPalettes || catalogPalettes.length === 0) {
    return null
  }
  const idx =
    typeof brand?.palette === "number" && brand.palette >= 0 && brand.palette < catalogPalettes.length
      ? brand.palette
      : 0
  return catalogPalettes[idx] ?? catalogPalettes[0] ?? null
}

export function ensureGoogleFontLoaded(fontName?: string | null) {
  if (typeof document === "undefined" || !fontName) return
  const trimmed = fontName.trim()
  if (!trimmed) return
  const key = trimmed.toLowerCase()
  if (loadedFonts.has(key)) return
  loadedFonts.add(key)

  const familyParam = encodeURIComponent(trimmed).replace(/%20/g, "+")
  const href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@400;600;700&display=swap`
  if (document.querySelector(`link[href="${href}"]`)) return

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  document.head.appendChild(link)
}

