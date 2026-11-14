import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layouts/app-layout"
import { appRoutes } from "@/routes/app-routes"

import { NotFoundPage } from "./not-found-page"
import { RootLayout } from "./root-layout"
import { RouteErrorBoundary } from "./route-error-boundary"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        children: [...appRoutes, { path: "*", element: <NotFoundPage /> }],
      },
    ],
  },
])
