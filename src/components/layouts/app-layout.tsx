import { Outlet } from "react-router"

import { Sidebar } from "@/components/core/sidebar"
import { Topbar } from "@/components/core/topbar"

export function AppLayout() {
  return (
    <div className="grid h-full overflow-hidden grid-cols-[232px_1fr] max-md:grid-cols-1">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Topbar />
        <div className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col overflow-auto px-8 py-6 max-md:px-4 max-md:pb-24 has-[.product-run]:overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
