import type { OutreachTemplate, Partner, ScoutResult } from "@/shared/types/relay"

export function fillMessage(
  template: string,
  creator: Partner | ScoutResult | undefined,
  outreach: OutreachTemplate
) {
  const first = (creator?.name || "Hana").split(" ")[0]
  const niche = creator?.niche || "motherhood"
  return template
    .replaceAll("{{first_name}}", first)
    .replaceAll("{{niche}} ", creator && !creator.niche ? "" : `${niche.toLowerCase()} `)
    .replaceAll("{{niche}}", niche.toLowerCase())
    .replaceAll("{{split}}", `${outreach.split}/${100 - outreach.split}`)
    .replaceAll("{{your_name}}", "You")
}
