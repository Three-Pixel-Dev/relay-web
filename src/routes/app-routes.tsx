import type { RouteObject } from "react-router"

import { ComingSoonPage } from "@/components/common/coming-soon-page"
import {
  BuildPage,
  ConnectionsPage,
  DistributePage,
  PartnersPage,
  ProductOverviewPage,
  ProductsPage,
  ProfilePage,
  PromotePage,
  PublishPage,
  StartPage,
} from "@/constants/lazyload"

export const appRoutes: RouteObject[] = [
  { index: true, element: <StartPage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "products", element: <ProductsPage /> },
  { path: "products/:id", element: <ProductOverviewPage /> },
  { path: "products/:id/build", element: <BuildPage /> },
  { path: "products/:id/publish", element: <PublishPage /> },
  { path: "products/:id/distribute", element: <DistributePage /> },
  { path: "products/:id/promote", element: <PromotePage /> },
  { path: "partners", element: <PartnersPage /> },
  { path: "connections", element: <ConnectionsPage /> },
  {
    path: "admin",
    element: (
      <ComingSoonPage
        title="Admin — coming soon"
        description="Workspace analytics and admin metrics will be enabled in a future phase."
      />
    ),
  },
]
