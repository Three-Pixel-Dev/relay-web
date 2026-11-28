import { useState } from "react"

import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: number
  className?: string
}

function initialsFrom(name?: string | null, email?: string | null) {
  return (
    (name || email || "YO")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "YO"
  )
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 36,
  className,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(avatarUrl) && !failed
  const initials = initialsFrom(name, email)
  const fontSize = Math.max(11, Math.round(size * 0.36))

  if (showImage) {
    return (
      <img
        src={avatarUrl!}
        alt=""
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-linear-to-br from-lilac to-sky font-extrabold text-lilac-foreground",
        className
      )}
      style={{ width: size, height: size, fontSize }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
