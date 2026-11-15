import { Outlet } from "react-router"

import { Sidebar } from "@/components/core/sidebar"
import { Topbar } from "@/components/core/topbar"

export function AppLayout() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
