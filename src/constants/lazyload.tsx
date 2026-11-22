import { pageLoader } from "@/components/core/page-loader"

export const StartPage = pageLoader(
  () => import("@/features/start/pages/start-page"),
  "StartPage"
)

export const ProductsPage = pageLoader(
  () => import("@/features/products/pages/products-page"),
  "ProductsPage"
)

export const ConnectionsPage = pageLoader(
  () => import("@/features/connections/pages/connections-page"),
  "ConnectionsPage"
)

export const ProfilePage = pageLoader(
  () => import("@/features/auth/pages/profile-page"),
  "ProfilePage"
)

export const ProductOverviewPage = pageLoader(
  () => import("@/features/products/pages/product-overview-page"),
  "ProductOverviewPage"
)

export const BuildPage = pageLoader(
  () => import("@/features/products/pages/build-page"),
  "BuildPage"
)

export const PartnersPage = pageLoader(
  () => import("@/features/partners/pages/partners-page"),
  "PartnersPage"
)
