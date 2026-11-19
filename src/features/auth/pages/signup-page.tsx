import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"

import { Spin } from "@/components/common/spin"
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { ROUTES } from "@/constants/routes"
import { fieldClass, protoBtn } from "@/lib/proto"
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
      <h1 className="mb-1.5 text-2xl">Create account</h1>
      <p className="mb-[18px] text-[13px] text-muted-foreground">
        No trial. After signup you can choose a 6-month or yearly plan.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[13px]">Name</span>
          <input className={fieldClass} autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <span className="text-[13px] text-destructive">
              {form.formState.errors.name.message}
            </span>
          ) : null}
        </label>
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
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <span className="text-[13px] text-destructive">
              {form.formState.errors.password.message}
            </span>
          ) : null}
        </label>
        <button type="submit" className={protoBtn()} disabled={signup.isPending}>
          {signup.isPending ? <Spin /> : null}
          Create account
        </button>
      </form>

      <div className="my-[18px] text-center text-[13px] text-muted-foreground">or</div>
      <GoogleSignInButton onSuccess={() => void navigate(ROUTES.connections)} />

      <p className="mt-[18px] text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link to={ROUTES.login} className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
