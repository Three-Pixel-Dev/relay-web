import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Spin } from "@/components/common/spin"
import { cardClass, fieldClass, noteClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import {
  useMeQuery,
  useSetPasswordMutation,
  useUpdateProfileMutation,
} from "@/shared/queries/auth.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { data: me, isLoading } = useMeQuery()
  const updateProfile = useUpdateProfileMutation()
  const setPassword = useSetPasswordMutation()
  const showToast = useUiStore((s) => s.showToast)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (me?.name) {
      profileForm.reset({ name: me.name })
    }
  }, [me?.name, profileForm])

  if (isLoading || !me) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    )
  }

  const hasPassword = Boolean(me.hasPassword)

  function onSaveProfile(values: ProfileValues) {
    updateProfile.mutate(values.name, {
      onSuccess: () => showToast("Profile saved."),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  function onSavePassword(values: PasswordValues) {
    if (hasPassword && !values.currentPassword?.trim()) {
      passwordForm.setError("currentPassword", { message: "Current password is required" })
      return
    }
    setPassword.mutate(
      {
        currentPassword: hasPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          showToast(hasPassword ? "Password updated." : "Password set. You can sign in with email too.")
          passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
        },
        onError: (error) => showToast(apiError(error).message),
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5 py-2">
      <div>
        <h1 className="mb-1.5 text-2xl font-semibold">Profile</h1>
        <p className="text-[13px] text-muted-foreground">
          Update your name and {hasPassword ? "change" : "set"} your password.
        </p>
      </div>

      <section className={cardClass}>
        <div className="mb-4 flex items-center gap-3">
          {me.avatarUrl ? (
            <img src={me.avatarUrl} alt="" className="size-12 rounded-full object-cover" />
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-linear-to-br from-lilac to-sky text-sm font-extrabold text-lilac-foreground">
              {(me.name || me.email)
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("") || "YO"}
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold">{me.name || "—"}</div>
            <div className="truncate text-[13px] text-muted-foreground">{me.email}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {me.googleLinked ? (
                <span className={protoChip({ variant: "sky" })}>Google linked</span>
              ) : null}
              <span className={protoChip({ variant: hasPassword ? "mint" : "outline" })}>
                {hasPassword ? "Password set" : "No password yet"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-[13px]">Name</span>
            <input className={fieldClass} autoComplete="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name ? (
              <span className="text-[13px] text-destructive">
                {profileForm.formState.errors.name.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1.5">
            <span className="text-[13px]">Email</span>
            <input className={cn(fieldClass, "opacity-70")} value={me.email} disabled readOnly />
          </label>
          <button type="submit" className={protoBtn()} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Spin /> : null}
            Save profile
          </button>
        </form>
      </section>

      <section className={cardClass}>
        <h2 className="mb-1 text-lg font-semibold">
          {hasPassword ? "Change password" : "Set a password"}
        </h2>
        <p className={cn(noteClass, "mb-4")}>
          {hasPassword
            ? "Use a new password for email sign-in. Google Sign-In still works."
            : "You signed in with Google. Set a password here if you also want email/password sign-in."}
        </p>

        <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="grid gap-3">
          {hasPassword ? (
            <label className="grid gap-1.5">
              <span className="text-[13px]">Current password</span>
              <input
                className={fieldClass}
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
            </label>
          ) : null}
          <label className="grid gap-1.5">
            <span className="text-[13px]">New password</span>
            <input
              className={fieldClass}
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
            />
            {passwordForm.formState.errors.newPassword ? (
              <span className="text-[13px] text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1.5">
            <span className="text-[13px]">Confirm password</span>
            <input
              className={fieldClass}
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword ? (
              <span className="text-[13px] text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </span>
            ) : null}
          </label>
          <button type="submit" className={protoBtn()} disabled={setPassword.isPending}>
            {setPassword.isPending ? <Spin /> : null}
            {hasPassword ? "Update password" : "Set password"}
          </button>
        </form>
      </section>
    </div>
  )
}
