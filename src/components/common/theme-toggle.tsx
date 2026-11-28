import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/shared/stores/theme.store"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-border-strong",
        className
      )}
      aria-label="Switch light or night mode"
      title="Light / night mode"
    >
      {mode === "dark" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
    </button>
  )
}
