import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { ROUTES } from "@/constants/routes"
import { useSignupMutation } from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
})

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useSignupMutation()
  const showToast = useUiStore((s) => s.showToast)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  function onSubmit(values: FormValues) {
    signup.mutate(values, {
      onSuccess: () => {
        showToast("Account created.")
        void navigate(ROUTES.connections)
      },
      onError: (error) => showToast(apiError(error).message),
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Create account</h1>
      <p className="muted small" style={{ marginBottom: 18 }}>
        No trial. After signup you can choose a 6-month or yearly plan.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="stack" style={{ gap: 12 }}>
        <label className="stack" style={{ gap: 6 }}>
          <span className="small">Name</span>
          <input className="input" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <span className="small" style={{ color: "salmon" }}>
              {form.formState.errors.name.message}
            </span>
          ) : null}
        </label>
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
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <span className="small" style={{ color: "salmon" }}>
              {form.formState.errors.password.message}
            </span>
          ) : null}
        </label>
        <button type="submit" className="btn sun" disabled={signup.isPending}>
          {signup.isPending ? <span className="spin" /> : null}
          Create account
        </button>
      </form>

      <div style={{ margin: "18px 0", textAlign: "center" }} className="muted small">
        or
      </div>
      <GoogleSignInButton onSuccess={() => void navigate(ROUTES.connections)} />

      <p className="muted small" style={{ marginTop: 18, textAlign: "center" }}>
        Already have an account? <Link to={ROUTES.login}>Sign in</Link>
      </p>
    </div>
  )
}
