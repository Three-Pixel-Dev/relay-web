import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion"
import type { ReactNode, RefObject } from "react"

import { fadeUp, staggerContainer, viewportOnce } from "@/shared/motion-variants"

interface RevealProps extends Omit<
  HTMLMotionProps<"div">,
  "children" | "variants" | "initial" | "animate" | "whileInView"
> {
  children: ReactNode
  className?: string
  variants?: Variants
  root?: RefObject<Element | null>
}

export function Reveal({
  children,
  className,
  variants = fadeUp,
  root,
  ...rest
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ ...viewportOnce, root: root ?? undefined }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

interface RevealGroupProps {
  children: ReactNode
  className?: string
  root?: RefObject<Element | null>
  variants?: Variants
  as?: "div" | "ol"
}

export function RevealGroup({
  children,
  className,
  root,
  variants = staggerContainer,
  as = "div",
}: RevealGroupProps) {
  const reduceMotion = useReducedMotion()
  const Static = as === "ol" ? "ol" : "div"
  const Motion = as === "ol" ? motion.ol : motion.div

  if (reduceMotion) {
    return <Static className={className}>{children}</Static>
  }

  return (
    <Motion
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ ...viewportOnce, root: root ?? undefined }}
    >
      {children}
    </Motion>
  )
}

interface RevealItemProps {
  children: ReactNode
  className?: string
  variants?: Variants
  as?: "div" | "li"
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as = "div",
}: RevealItemProps) {
  const Component = as === "li" ? motion.li : motion.div
  return (
    <Component className={className} variants={variants}>
      {children}
    </Component>
  )
}
