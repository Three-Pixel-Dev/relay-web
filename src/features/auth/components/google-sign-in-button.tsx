import { useEffect, useRef } from "react"

import { env } from "@/app/config/env"
import { useGoogleLoginMutation } from "@/shared/queries/auth.query"
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
            },
          ) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const googleLogin = useGoogleLoginMutation()
  const mutateRef = useRef(googleLogin.mutate)
  const onSuccessRef = useRef(onSuccess)
  const showToast = useUiStore((s) => s.showToast)

  mutateRef.current = googleLogin.mutate
  onSuccessRef.current = onSuccess

  useEffect(() => {
    if (!env.googleClientId || !hostRef.current) return

    let cancelled = false

    function mountButton() {
      if (cancelled || !hostRef.current || !window.google?.accounts?.id) return
      hostRef.current.innerHTML = ""
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
      window.google.accounts.id.renderButton(hostRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular",
      })
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]")
    if (existing) {
      if (window.google?.accounts?.id) mountButton()
      else existing.addEventListener("load", mountButton)
      return () => {
        cancelled = true
      }
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.googleGsi = "true"
    script.addEventListener("load", mountButton)
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [showToast])

  if (!env.googleClientId) {
    return (
      <p className="muted small" style={{ textAlign: "center" }}>
        Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In.
      </p>
    )
  }

  return <div ref={hostRef} style={{ display: "flex", justifyContent: "center" }} />
}
