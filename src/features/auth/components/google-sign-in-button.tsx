import { useEffect, useRef, useState } from "react"

import { env } from "@/app/config/env"
import { Spin } from "@/components/common/spin"
import { useGoogleLoginMutation } from "@/shared/queries/auth.query"
import { useThemeStore } from "@/shared/stores/theme.store"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string
              size?: string
              width?: number
              text?: string
              shape?: string
            }
          ) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void
}

type GsiState = "loading" | "ready" | "failed"

const GSI_SRC = "https://accounts.google.com/gsi/client"

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const googleLogin = useGoogleLoginMutation()
  const mutateRef = useRef(googleLogin.mutate)
  const onSuccessRef = useRef(onSuccess)
  const showToast = useUiStore((s) => s.showToast)
  const themeMode = useThemeStore((s) => s.mode)
  const [state, setState] = useState<GsiState>("loading")

  useEffect(() => {
    mutateRef.current = googleLogin.mutate
    onSuccessRef.current = onSuccess
  })

  useEffect(() => {
    if (!env.googleClientId) return

    let cancelled = false

    function mountButton() {
      const host = hostRef.current
      if (cancelled || !host || !window.google?.accounts?.id) return
      const width = Math.min(
        400,
        Math.max(240, Math.round(containerRef.current?.clientWidth || 356))
      )
      host.innerHTML = ""
      window.google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: (response) => {
          mutateRef.current(response.credential, {
            onSuccess: () => {
              showToast("Signed in with Google.")
              onSuccessRef.current?.()
            },
            onError: (error) => {
              showToast(apiError(error).message)
            },
          })
        },
      })
      window.google.accounts.id.renderButton(host, {
        theme: themeMode === "dark" ? "filled_black" : "outline",
        size: "large",
        width,
        text: "continue_with",
        shape: "rectangular",
      })
      setState("ready")
    }

    function fail() {
      if (!cancelled) setState("failed")
    }

    if (window.google?.accounts?.id) {
      mountButton()
      return () => {
        cancelled = true
      }
    }

    let script = document.querySelector<HTMLScriptElement>("script[data-google-gsi]")
    if (!script) {
      script = document.createElement("script")
      script.src = GSI_SRC
      script.async = true
      script.defer = true
      script.dataset.googleGsi = "true"
      document.head.appendChild(script)
    }
    script.addEventListener("load", mountButton)
    script.addEventListener("error", fail)

    return () => {
      cancelled = true
      script.removeEventListener("load", mountButton)
      script.removeEventListener("error", fail)
    }
  }, [showToast, themeMode])

  if (!env.googleClientId) {
    return (
      <p className="text-center text-[13px] text-muted-foreground">
        Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In.
      </p>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <div ref={hostRef} className="flex min-h-10 w-full items-center justify-center" />
      {state === "loading" ? (
        <p className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
          <Spin /> Loading Google sign-in…
        </p>
      ) : null}
      {state === "failed" ? (
        <p className="text-center text-[13px] text-destructive">
          Google sign-in could not load. Check your connection or ad blocker, then reload.
        </p>
      ) : null}
      {googleLogin.isPending ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
          <Spin /> Signing you in…
        </p>
      ) : null}
    </div>
  )
}
