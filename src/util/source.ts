import type { SourceKind } from "@/shared/types/relay"

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function isValidSourceLink(raw: string): boolean {
  const value = raw.trim()
  if (!value || /\s/.test(value)) return false
  // Allow Instagram @handles
  if (/^@[a-zA-Z0-9._]{1,60}$/.test(value)) return true
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false
    const host = parsed.hostname
    return Boolean(host && host.includes(".") && !host.startsWith(".") && !host.endsWith("."))
  } catch {
    return false
  }
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

export const SOURCE_FILE_ACCEPT =
  ".pdf,.docx,.txt,.md,.csv,.srt,.mp3,.wav,.m4a,.aac,.ogg,.flac,.mp4,.mov,.webm,.avi,.mkv"

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".avi", ".mkv"]

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".")
  return dot >= 0 ? name.slice(dot).toLowerCase() : ""
}

export function sourceChipLabel(kind: SourceKind, name: string) {
  if (kind === "file") {
    const ext = fileExtension(name)
    if (AUDIO_EXTENSIONS.includes(ext)) return "Audio"
    if (VIDEO_EXTENSIONS.includes(ext)) return "Video"
  }
  return SOURCE_KINDS[kind].short
}
