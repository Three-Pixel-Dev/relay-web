import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { Spin } from "@/components/common/spin"
import { ROUTES } from "@/constants/routes"
import { fieldClass, protoBtn } from "@/lib/proto"
import { useForgotPasswordMutation } from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const schema = z.object({
  email: z.email("Enter a valid email"),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const forgotPassword = useForgotPasswordMutation()
  const showToast = useUiStore((s) => s.showToast)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: FormValues) {
    forgotPassword.mutate(values.email, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  if (submitted) {
    return (
      <div>
        <h1 className="mb-1.5 text-2xl">Check your email</h1>
        <p className="mb-[18px] text-[13px] text-muted-foreground">
          If an account exists for that email, we sent password reset instructions. The link expires
          in about an hour.
        </p>
        <p className="text-[13px] text-muted-foreground">
          <Link
            to={ROUTES.login}
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl">Forgot password</h1>
      <p className="mb-[18px] text-[13px] text-muted-foreground">
        Enter your email and we&apos;ll send a reset link if that account uses a password.
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
        <button type="submit" className={protoBtn()} disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? <Spin /> : null}
          Send reset link
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        <Link
          to={ROUTES.login}
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
