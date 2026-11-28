import { cn } from "@/lib/utils"

interface RelayGuyMarkProps {
  size?: number
  className?: string
  alt?: string
}

export function RelayGuyMark({ size = 42, className, alt = "" }: RelayGuyMarkProps) {
  return (
    <img
      src="/brand/relayguy-avatar-circle-1024.png"
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={cn(
        "h-(--rg-mark) w-(--rg-mark) shrink-0 rounded-full border border-border-strong bg-white object-cover",
        className
      )}
      style={{ ["--rg-mark" as string]: `${size}px` }}
    />
  )
}

interface BrandLogoProps {
  size?: number
  showName?: boolean
  className?: string
  nameClassName?: string
}

export function BrandLogo({
  size = 42,
  showName = true,
  className,
  nameClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RelayGuyMark size={size} />
      {showName ? (
        <span
          className={cn(
            "font-heading text-[21px] leading-none tracking-[-0.02em] text-foreground",
            nameClassName
          )}
        >
          relayguy
        </span>
      ) : null}
    </span>
  )
}
