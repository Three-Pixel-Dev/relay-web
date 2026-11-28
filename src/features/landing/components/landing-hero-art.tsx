import { motion, useReducedMotion } from "framer-motion"

import { floatTransition } from "@/shared/motion-variants"
import { cn } from "@/lib/utils"

const STICKS = [
  {
    className: "top-[8%] -left-[5%] max-[900px]:left-0",
    label: "Step 5 of 7",
    title: "Manuscript",
    detail: "11 sections · 11,868 words",
    floatY: [-6, 5] as const,
    duration: 3.6,
    delay: 0.1,
  },
  {
    className: "top-[46%] -right-[6%] max-[900px]:right-0",
    label: "Live on Whop",
    title: "$17 checkout",
    detail: "Files sent after payment",
    floatY: [5, -7] as const,
    duration: 4.2,
    delay: 0.55,
  },
  {
    className: "bottom-[6%] left-[4%] max-[900px]:left-0",
    label: "AI spend so far",
    title: "$0.27",
    detail: "",
    floatY: [-4, 6] as const,
    duration: 3.9,
    delay: 0.95,
  },
]

export function LandingHeroArt() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="relative mx-auto aspect-square w-full max-w-[440px] rounded-[22px] border border-border bg-white max-[900px]:max-w-[320px]"
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
    >
      <motion.img
        src="/brand/relayguy-mark-square-1024.png"
        alt=""
        className="absolute inset-[8%] size-auto object-contain mix-blend-multiply"
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={floatTransition(5.2)}
      />

      {STICKS.map((stick) => (
        <StatusStick
          key={stick.title}
          className={stick.className}
          label={stick.label}
          title={stick.title}
          detail={stick.detail}
          floatY={stick.floatY}
          duration={stick.duration}
          delay={stick.delay}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </motion.div>
  )
}

interface StatusStickProps {
  className?: string
  label: string
  title: string
  detail: string
  floatY: readonly [number, number]
  duration: number
  delay: number
  reduceMotion: boolean
}

function StatusStick({
  className,
  label,
  title,
  detail,
  floatY,
  duration,
  delay,
  reduceMotion,
}: StatusStickProps) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={
        reduceMotion
          ? { opacity: 1, y: 0 }
          : {
              opacity: 1,
              y: floatY,
            }
      }
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : {
              opacity: { duration: 0.4, delay: delay * 0.35 },
              y: floatTransition(duration, delay),
            }
      }
    >
      <motion.div
        className="grid cursor-default gap-px rounded-xl border border-border bg-background px-3.5 py-2.5 shadow-[0_8px_24px_color-mix(in_oklab,var(--primary)_8%,transparent)] dark:shadow-[0_8px_24px_rgb(0_0_0_/0.4)]"
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.05,
                rotate: -1.5,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <small className="text-[11.5px] font-semibold text-muted-foreground">{label}</small>
        <b className="text-[17px] font-extrabold tracking-[-0.02em]">{title}</b>
        {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      </motion.div>
    </motion.div>
  )
}
