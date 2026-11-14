import { Outlet } from "react-router"
import { useTranslation } from "react-i18next"

import { Sidebar } from "@/components/core/sidebar"
import { Topbar } from "@/components/core/topbar"

export function AppLayout() {
  const { t } = useTranslation("common")

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="proto-strip">
          <span>{t("shell.proto_label")}</span>
          <span>{t("shell.proto_sim")}</span>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
