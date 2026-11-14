import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { buttonVariants } from "@/components/ui/button"

export function NotFoundPage() {
  const { t } = useTranslation("common")

  return (
    <section className="flex min-h-96 flex-col items-start gap-3">
      <h1 className="text-[26px] font-bold tracking-tight">
        {t("states.not_found_title")}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {t("states.not_found_description")}
      </p>
      <Link to="/" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeftIcon className="size-4" />
        {t("actions.back_home")}
      </Link>
    </section>
  )
}
