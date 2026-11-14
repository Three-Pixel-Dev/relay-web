# Relay — project theme

Relay ships **one theme**: dark indigo, Sora, and the sun / mint / coral / lilac accents from the prototype (`source/relay/app.css` and the handoff HTML). There is no light mode, no `ThemeProvider`, and no `prefers-color-scheme` toggle.

Tokens live only in `src/styles/globals.css`. Components use semantic Tailwind classes (`bg-background`, `text-primary`, `border-border`, `bg-success`). Do not use raw hex, `text-red-500`, or arbitrary colors in JSX.

## Type

| Token | Value |
| --- | --- |
| Family | **Sora** (variable), then `ui-sans-serif`, system UI |
| Weights | 400, 500, 600, 700, 800 |
| Body | 15px / 1.55 |
| Headings | tight line-height, letter-spacing about `-0.02em` to `-0.035em` |
| Smoothing | `-webkit-font-smoothing: antialiased` |

Loaded via `@fontsource-variable/sora` in `src/styles/globals.css`. HTML `theme-color` is `#14121c`.

## Color tokens (from the prototype)

| Prototype | Hex | Semantic token | Use |
| --- | --- | --- | --- |
| `--ink` | `#14121c` | `background` | Page and rail |
| `--ink-2` | `#1a1726` | `muted` / inset surfaces | Inputs, notes, flat cards |
| `--card` | `#1f1b2e` | `card`, `popover`, `sidebar` | Cards, menus, raised panels |
| `--card-2` | `#262238` | `secondary`, `accent` | Soft buttons, chips, inner fills |
| `--line` | `#2f2a44` | `border`, `input` | Default borders |
| `--line-2` | `#3b3556` | (border hover / dashed) | Ghost button border, drop zones |
| `--text` | `#f3efe6` | `foreground`, `*-foreground` on dark fills | Body copy |
| `--muted` | `#9d97b3` | `muted-foreground` | Secondary copy, nav idle |
| `--dim` | `#6f6a86` | `dim` | Placeholders, proto-quiet text |
| `--sun` | `#ffcf5a` | `primary`, `warning`, `ring` | Primary actions, focus ring, links |
| `--sun-ink` | `#2a1f00` | `primary-foreground`, `warning-foreground` | Text on sun |
| `--mint` | `#7ee8b0` | `success` | Connected, done, positive |
| `--mint-ink` | `#062b19` | `success-foreground` | Text on mint |
| `--coral` | `#ff7a59` | `destructive` | Danger, over-budget, missing plan |
| `--sky` | `#8fc9ff` | `info`, `sky` | Info chips, cool accent |
| `--lilac` | `#c7b4ff` | `lilac` | Accent chips, avatar gradient with sky |

Avatar fill in the prototype is `linear-gradient(135deg, lilac, sky)` with ink-colored initials.

## Radius

| Prototype | Size | Mapped |
| --- | --- | --- |
| `--r-sm` | 8px | `rounded-sm` / small controls |
| `--r-md` | 12px | `--radius` (shadcn base, buttons, inputs) |
| `--r-lg` | 16px | cards |
| `--r-xl` | 22px | empty states, large gates |

## Motion

Keep UI motion short (about 150–300ms). Prefer transform and opacity. Respect `prefers-reduced-motion` via the shared Framer Motion helper in `src/shared/motion.ts`.

## Component mapping

| Prototype class | Production |
| --- | --- |
| `.btn.sun` | `Button` default (`bg-primary text-primary-foreground`) |
| `.btn.mint` | `Button` with success tokens when we need a secondary positive action |
| `.btn.ghost` | `Button variant="outline"` / `ghost` |
| `.btn.danger` | `Button variant="destructive"` |
| `.chip.sun` / `.mint` / `.coral` / `.sky` / `.lilac` | Badge using the named tokens |
| `.card` | `bg-card border-border rounded-lg` (or a shared card primitive) |
| Focus | `ring` = sun; inputs use sun on focus |

## What not to do

- Do not reintroduce `.dark` / `.light` class switching or a `d` keyboard toggle
- Do not add a second `:root` light palette
- Do not mix Inter (scaffold default) back in; Sora is the only UI face
- If a new color is needed, add a named token in `globals.css` first, then use the class
