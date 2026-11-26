import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"

import { Spin } from "@/components/common/spin"
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { ROUTES } from "@/constants/routes"
import { fieldClass, protoBtn } from "@/lib/proto"
import { useLoginMutation } from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const [mode, setMode] = useState<"google" | "password">("google")
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

  if (mode === "password") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMode("google")}
          className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Google sign-in
        </button>
        <h1 className="mb-1.5 text-2xl">Sign in with password</h1>
        <p className="mb-[18px] text-[13px] text-muted-foreground">
          Use the email and password you set in Profile.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-[13px]">Email</span>
            <input
              className={fieldClass}
              type="email"
              autoComplete="email"
              autoFocus
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <span className="text-[13px] text-destructive">
                {form.formState.errors.email.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px]">Password</span>
              <Link
                to={ROUTES.forgotPassword}
                className="text-[12px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              className={fieldClass}
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <span className="text-[13px] text-destructive">
                {form.formState.errors.password.message}
              </span>
            ) : null}
          </label>
          <button type="submit" className={protoBtn()} disabled={login.isPending}>
            {login.isPending ? <Spin /> : null}
            Sign in
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl">Sign in</h1>
      <p className="mb-[18px] text-[13px] text-muted-foreground">
        New here? Continue with Google — you can set a password later in Profile. No trial.
      </p>

      <GoogleSignInButton onSuccess={() => void navigate(ROUTES.start)} />

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => setMode("password")}
          className="cursor-pointer text-[13px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Already set a password?
        </button>
      </div>

      <p className="mt-4 text-center text-[12px] text-muted-foreground">
        <Link
          to={ROUTES.terms}
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Terms of Service
        </Link>
        <span className="mx-1.5 text-border">·</span>
        <Link
          to={ROUTES.privacy}
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
