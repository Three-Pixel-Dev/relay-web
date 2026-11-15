import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layouts/app-layout"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { LoginPage } from "@/features/auth/pages/login-page"
import { SignupPage } from "@/features/auth/pages/signup-page"
import { RequireAuth } from "@/features/auth/components/require-auth"
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
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [...appRoutes, { path: "*", element: <NotFoundPage /> }],
          },
        ],
      },
    ],
  },
])
