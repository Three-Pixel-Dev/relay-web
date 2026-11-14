import type { RouteObject } from "react-router"

import {
  AdminPage,
  BuildPage,
  ConnectionsPage,
  DistributePage,
  PartnersPage,
  ProductOverviewPage,
  ProductsPage,
  PromotePage,
  PublishPage,
  StartPage,
} from "@/constants/lazyload"

export const appRoutes: RouteObject[] = [
  { index: true, element: <StartPage /> },
  { path: "products", element: <ProductsPage /> },
  { path: "products/:id", element: <ProductOverviewPage /> },
  { path: "products/:id/build", element: <BuildPage /> },
  { path: "products/:id/publish", element: <PublishPage /> },
  { path: "products/:id/distribute", element: <DistributePage /> },
  { path: "products/:id/promote", element: <PromotePage /> },
  { path: "partners", element: <PartnersPage /> },
  { path: "connections", element: <ConnectionsPage /> },
  { path: "admin", element: <AdminPage /> },
]
