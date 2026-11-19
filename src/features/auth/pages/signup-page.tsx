import { Navigate } from "react-router"

import { ROUTES } from "@/constants/routes"

/** Signup UI removed — Google creates accounts; email users sign in on /login. */
export function SignupPage() {
  return <Navigate to={ROUTES.login} replace />
}
