import { useEffect, useRef } from "react"

import { env } from "@/app/config/env"
import { Spin } from "@/components/common/spin"
import { protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
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

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
      const measuredWidth = Math.min(
        400,
        Math.max(240, Math.round(containerRef.current?.clientWidth || 356))
      )
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
        theme: "filled_black",
        size: "large",
        width: measuredWidth,
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
      <p className="text-center text-[13px] text-muted-foreground">
        Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In.
      </p>
    )
  }

  return (
    <div ref={containerRef} className="group relative w-full">
      <div
        aria-hidden="true"
        className={cn(
          protoBtn({ variant: "ghost" }),
          "pointer-events-none w-full border-border-strong bg-muted text-foreground transition-colors group-hover:border-primary/50 group-hover:bg-secondary"
        )}
      >
        {googleLogin.isPending ? <Spin /> : <GoogleMark />}
        <span>Continue with Google</span>
      </div>
      <div
        ref={hostRef}
        style={{ colorScheme: "light" }}
        className="absolute inset-0 flex cursor-pointer items-center justify-center overflow-hidden rounded-md opacity-[0.01] [&_iframe]:!h-full [&_iframe]:!w-full"
      />
    </div>
  )
}

function GoogleMark() {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  )
}
