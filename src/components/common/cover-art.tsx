import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { apiClient } from "@/app/api/client"
import { Skeleton } from "@/components/ui/skeleton"
import { ensureGoogleFontLoaded } from "@/lib/brand-palette"
import { cn } from "@/lib/utils"
import type { Palette } from "@/shared/types/relay"

interface CoverArtProps {
  palette: Palette
  variant: number
  title: string
  imageUrl?: string | null
}

function toApiRelativePath(url: string) {
  return url.startsWith("/api/") ? url.slice(4) : url
}

export function AuthGraphic({
  imageUrl,
  alt,
  className,
  fallback,
  showSkeleton = false,
}: {
  imageUrl?: string | null
  alt: string
  className?: string
  fallback?: ReactNode
  showSkeleton?: boolean
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(imageUrl))

  useEffect(() => {
    if (!imageUrl) {
      setBlobUrl(null)
      setFailed(false)
      setIsLoading(false)
      return
    }
    let active = true
    let createdUrl: string | null = null
    setBlobUrl(null)
    setFailed(false)
    setIsLoading(true)

    apiClient
      .get<Blob>(toApiRelativePath(imageUrl), { responseType: "blob" })
      .then((res) => {
        if (!active) return
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
        createdUrl = URL.createObjectURL(blob)
        setBlobUrl(createdUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [imageUrl])

  if (isLoading && showSkeleton) {
    return <Skeleton className={cn("rounded-none", className)} />
  }
  if (blobUrl && !failed) {
    return <img src={blobUrl} alt={alt} className={className} />
  }
  return <>{fallback ?? null}</>
}

export function CoverArt({ palette, variant, title, imageUrl }: CoverArtProps) {
  const svgFallback = <CoverArtSvg palette={palette} variant={variant} title={title} />

  if (imageUrl) {
    return (
      <AuthGraphic
        imageUrl={imageUrl}
        alt={title}
        className="block aspect-3/4 w-full object-cover"
        fallback={svgFallback}
        showSkeleton
      />
    )
  }

  return svgFallback
}

function CoverArtSvg({
  palette,
  variant,
  title,
}: {
  palette: Palette
  variant: number
  title: string
}) {
  useEffect(() => {
    ensureGoogleFontLoaded(palette.display)
  }, [palette.display])

  const [page, ink, acc, tint] = palette.cols
  const words = title.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if (`${current} ${word}`.trim().length > 16) {
      lines.push(current.trim())
      current = word
    } else {
      current += ` ${word}`
    }
  }
  if (current.trim()) lines.push(current.trim())
  const bg = variant === 1 ? ink : page
  const textFill = variant === 1 ? page : ink
  const anchor = variant === 2 ? "middle" : "start"
  const x = variant === 2 ? 150 : 24

  return (
    <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="400" fill={bg} />
      {variant === 0 ? (
        <>
          <rect x="0" y="260" width="300" height="140" fill={acc} />
          <circle cx="230" cy="300" r="46" fill={tint} />
        </>
      ) : variant === 1 ? (
        <>
          <circle cx="150" cy="290" r="90" fill={acc} opacity=".9" />
          <rect x="24" y="360" width="120" height="6" fill={tint} />
        </>
      ) : (
        <>
          <rect x="24" y="200" width="252" height="160" rx="12" fill={tint} />
          <path
            d="M60 330c40-60 80-60 120-10s60 30 76 10"
            stroke={acc}
            strokeWidth="6"
            fill="none"
          />
        </>
      )}
      {lines.slice(0, 4).map((line, index) => (
        <text
          key={`${line}-${index}`}
          x={x}
          y={70 + index * 26}
          fontFamily={`${palette.display}, Georgia, serif`}
          fontWeight="700"
          fontSize="20"
          fill={textFill}
          textAnchor={anchor}
        >
          {line}
        </text>
      ))}
      <text
        x={x}
        y="380"
        fontFamily="sans-serif"
        fontSize="10"
        fill={variant === 1 ? tint : ink}
        textAnchor={anchor}
        opacity=".8"
      >
        A RELAYGUY-BUILT GUIDE
      </text>
    </svg>
  )
}

export function PosterLite() {
  return (
    <svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="90" height="120" className="fill-primary" />
      <rect x="14" y="18" width="62" height="6" rx="3" className="fill-primary-foreground" />
      <rect x="14" y="32" width="48" height="4" rx="2" className="fill-muted-foreground" />
      <rect x="14" y="42" width="56" height="4" rx="2" className="fill-muted-foreground" />
    </svg>
  )
}
