import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layouts/app-layout"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import { ResetPasswordPage } from "@/features/auth/pages/reset-password-page"
import { SignupPage } from "@/features/auth/pages/signup-page"
import { RequireAuth } from "@/features/auth/components/require-auth"
import { PrivacyPage } from "@/features/legal/pages/privacy-page"
import { TermsPage } from "@/features/legal/pages/terms-page"
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
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
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
