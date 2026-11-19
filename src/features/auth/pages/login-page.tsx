import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
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
      <h1 className="mb-1.5 text-2xl">Sign in</h1>
      <p className="mb-[18px] text-[13px] text-muted-foreground">
        Email/password or Google. New here? Continue with Google — you can set a password later in
        Profile. No trial.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[13px]">Email</span>
          <input className={fieldClass} type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <span className="text-[13px] text-destructive">
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px]">Password</span>
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

      <div className="my-[18px] text-center text-[13px] text-muted-foreground">or</div>
      <GoogleSignInButton onSuccess={() => void navigate(ROUTES.start)} />
    </div>
  )
}
