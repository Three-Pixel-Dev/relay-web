import type { RouteObject } from "react-router"

import { ComingSoonPage } from "@/components/common/coming-soon-page"
import {
  BuildPage,
  ConnectionsPage,
  PartnersPage,
  ProductOverviewPage,
  ProductsPage,
  ProfilePage,
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
  {
    path: "products/:id/distribute",
    element: (
      <ComingSoonPage
        title="Distribute — coming soon"
        description="Automated distribution channels will be enabled in a future phase."
      />
    ),
  },
  {
    path: "products/:id/promote",
    element: (
      <ComingSoonPage
        title="Promote — coming soon"
        description="Promo video generation and scheduling will be enabled in a future phase."
      />
    ),
  },
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
