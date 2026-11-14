import type { Palette } from "@/shared/types/relay"

interface CoverArtProps {
  palette: Palette
  variant: number
  title: string
}

export function CoverArt({ palette, variant, title }: CoverArtProps) {
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
          key={line}
          x={x}
          y={70 + index * 26}
          fontFamily="Georgia,serif"
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
        A RELAY-BUILT GUIDE
      </text>
    </svg>
  )
}

export function PosterLite() {
  return (
    <svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="120" fill="#262238" />
      <rect x="14" y="18" width="62" height="6" rx="3" fill="#ffcf5a" />
      <rect x="14" y="32" width="48" height="4" rx="2" fill="#5f5a7a" />
      <rect x="14" y="42" width="56" height="4" rx="2" fill="#5f5a7a" />
    </svg>
  )
}
