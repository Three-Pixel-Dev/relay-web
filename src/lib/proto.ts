import { cva, type VariantProps } from "class-variance-authority"

export const protoBtn = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-transparent px-[18px] py-[11px] text-sm font-bold whitespace-nowrap transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        sun: "bg-primary text-primary-foreground hover:bg-primary/85",
        mint: "bg-success text-success-foreground",
        ghost: "border-border-strong bg-transparent text-foreground hover:bg-muted",
        soft: "bg-secondary text-foreground hover:bg-border",
        danger: "text-destructive hover:bg-destructive/10",
      },
      size: {
        md: "",
        big: "rounded-[14px] px-6 py-[15px] text-base",
      },
    },
    defaultVariants: { variant: "sun", size: "md" },
  }
)

export type ProtoBtnProps = VariantProps<typeof protoBtn>

export const protoChip = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-secondary text-muted-foreground",
        mint: "bg-success/15 text-success",
        sun: "bg-primary/15 text-primary",
        coral: "bg-destructive/15 text-destructive",
        sky: "bg-info/15 text-info",
        lilac: "bg-lilac/15 text-lilac",
        outline: "border-border-strong bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export const fieldClass =
  "w-full rounded-md border-[1.5px] border-border bg-muted px-3 py-[11px] text-foreground outline-none transition-colors focus:border-primary"

export const labelClass = "mb-1.5 block text-[13px] font-semibold text-muted-foreground"

export const cardClass = "rounded-lg border border-border bg-card p-5"

export const noteClass =
  "flex gap-2.5 rounded-md border border-border bg-muted px-3.5 py-3 text-[13px] leading-normal text-muted-foreground"

export const kvClass =
  "flex items-center justify-between gap-3 border-b border-dashed border-border py-2 text-[13px] last:border-b-0"

export const actionBarClass =
  "z-[4] flex shrink-0 flex-wrap items-center gap-2.5 border-t border-border bg-background py-3.5"

export const linkClass = "border-0 bg-transparent p-0 text-[13px] font-bold text-primary"
