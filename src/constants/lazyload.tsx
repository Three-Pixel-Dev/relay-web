import { pageLoader } from "@/components/core/page-loader"

export const StartPage = pageLoader(
  () => import("@/features/start/pages/start-page"),
  "StartPage"
)

export const ProductsPage = pageLoader(
  () => import("@/features/products/pages/products-page"),
  "ProductsPage"
)

export const PartnersPage = pageLoader(
  () => import("@/features/partners/pages/partners-page"),
  "PartnersPage"
)

export const ConnectionsPage = pageLoader(
  () => import("@/features/connections/pages/connections-page"),
  "ConnectionsPage"
)

export const ProductOverviewPage = pageLoader(
  () => import("@/features/products/pages/product-overview-page"),
  "ProductOverviewPage"
)

export const BuildPage = pageLoader(
  () => import("@/features/products/pages/build-page"),
  "BuildPage"
)

export const PublishPage = pageLoader(
  () => import("@/features/products/pages/publish-page"),
  "PublishPage"
)

export const DistributePage = pageLoader(
  () => import("@/features/products/pages/distribute-page"),
  "DistributePage"
)

export const PromotePage = pageLoader(
  () => import("@/features/products/pages/promote-page"),
  "PromotePage"
)

export const AdminPage = pageLoader(
  () => import("@/features/admin/pages/admin-page"),
  "AdminPage"
)
