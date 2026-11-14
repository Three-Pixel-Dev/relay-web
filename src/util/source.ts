import type { SourceKind } from "@/shared/types/relay"

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function linkKind(url: string): SourceKind {
  if (/youtu\.?be/i.test(url)) return "youtube"
  if (/instagram\.com|^@/i.test(url)) return "instagram"
  return "web"
}

export function linkName(url: string) {
  const kind = linkKind(url)
  const trimmed = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
  if (kind === "instagram") {
    const handle = trimmed
      .replace(/^instagram\.com\//, "")
      .replace(/^@/, "")
      .split(/[/?]/)[0]
    return `@${handle}`
  }
  if (kind === "youtube") {
    const handle = trimmed.split("/").pop()?.split("?")[0] ?? trimmed
    return handle.startsWith("@") ? handle : `youtube.com/${handle}`
  }
  return trimmed.slice(0, 40)
}

export const SOURCE_KINDS: Record<SourceKind, { label: string; short: string }> = {
  file: { label: "Document", short: "Doc" },
  youtube: { label: "YouTube", short: "YT" },
  instagram: { label: "Instagram", short: "IG" },
  web: { label: "Web page", short: "Web" },
}
