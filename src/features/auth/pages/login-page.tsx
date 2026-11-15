import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { ROUTES } from "@/constants/routes"
import { useLoginMutation } from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const showToast = useUiStore((s) => s.showToast)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: FormValues) {
    login.mutate(values, {
      onSuccess: () => {
        showToast("Welcome back.")
        void navigate(ROUTES.start)
      },
      onError: (error) => showToast(apiError(error).message),
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Sign in</h1>
      <p className="muted small" style={{ marginBottom: 18 }}>
        Use email/password or Google. No trial — pick a plan after you sign in.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="stack" style={{ gap: 12 }}>
        <label className="stack" style={{ gap: 6 }}>
          <span className="small">Email</span>
          <input className="input" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <span className="small" style={{ color: "salmon" }}>
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="stack" style={{ gap: 6 }}>
          <span className="small">Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <span className="small" style={{ color: "salmon" }}>
              {form.formState.errors.password.message}
            </span>
          ) : null}
        </label>
        <button type="submit" className="btn sun" disabled={login.isPending}>
          {login.isPending ? <span className="spin" /> : null}
          Sign in
        </button>
      </form>

      <div style={{ margin: "18px 0", textAlign: "center" }} className="muted small">
        or
      </div>
      <GoogleSignInButton onSuccess={() => void navigate(ROUTES.start)} />

      <p className="muted small" style={{ marginTop: 18, textAlign: "center" }}>
        New here? <Link to={ROUTES.signup}>Create an account</Link>
      </p>
    </div>
  )
}
