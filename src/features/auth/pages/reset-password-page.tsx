import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import { z } from "zod"

import { Spin } from "@/components/common/spin"
import { ROUTES } from "@/constants/routes"
import { fieldClass, protoBtn } from "@/lib/proto"
import { useResetPasswordMutation } from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const schema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = useMemo(() => (params.get("token") ?? "").trim(), [params])
  const navigate = useNavigate()
  const resetPassword = useResetPasswordMutation()
  const showToast = useUiStore((s) => s.showToast)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  function onSubmit(values: FormValues) {
    if (!token) {
      showToast("This reset link is missing a token. Request a new one.")
      return
    }
    resetPassword.mutate(
      { token, newPassword: values.newPassword },
      {
        onSuccess: () => {
          showToast("Password updated. You can sign in now.")
          void navigate(ROUTES.login)
        },
        onError: (error) => showToast(apiError(error).message),
      },
    )
  }

  if (!token) {
    return (
      <div>
        <h1 className="mb-1.5 text-2xl">Reset link invalid</h1>
        <p className="mb-[18px] text-[13px] text-muted-foreground">
          This page needs a valid token from your email. Request a new reset link and try again.
        </p>
        <p className="text-[13px] text-muted-foreground">
          <Link
            to={ROUTES.forgotPassword}
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Request a new link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl">Set a new password</h1>
      <p className="mb-[18px] text-[13px] text-muted-foreground">
        Choose a new password for your Relay account. Links expire after about an hour.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[13px]">New password</span>
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            autoFocus
            {...form.register("newPassword")}
          />
          {form.formState.errors.newPassword ? (
            <span className="text-[13px] text-destructive">
              {form.formState.errors.newPassword.message}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px]">Confirm password</span>
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <span className="text-[13px] text-destructive">
              {form.formState.errors.confirmPassword.message}
            </span>
          ) : null}
        </label>
        <button type="submit" className={protoBtn()} disabled={resetPassword.isPending}>
          {resetPassword.isPending ? <Spin /> : null}
          Update password
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Link expired?{" "}
        <Link
          to={ROUTES.forgotPassword}
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Request a new one
        </Link>
      </p>
    </div>
  )
}
