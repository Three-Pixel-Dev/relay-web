import { motion, useReducedMotion } from "framer-motion"

import { RelayGuyMark } from "@/components/common/relayguy-mark"

export function PageSkeleton() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="grid h-full min-h-[50vh] w-full place-items-center"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.06, 1],
                  opacity: [0.85, 1, 0.85],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <RelayGuyMark size={64} className="border-[1.5px]" />
        </motion.div>
        <motion.span
          className="font-heading text-sm tracking-[-0.02em] text-muted-foreground"
          animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          Loading…
        </motion.span>
      </div>
    </div>
  )
}
