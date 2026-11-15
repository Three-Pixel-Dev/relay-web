import { create } from "zustand"

import type { MeUser } from "@/shared/types/api"

const ACCESS_KEY = "relay-access-token"
const REFRESH_KEY = "relay-refresh-token"

interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  user: MeUser | null
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void
  setUser: (user: MeUser | null) => void
  clear: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: localStorage.getItem(ACCESS_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  user: null,
  setTokens: (accessToken, refreshToken = null) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
    else localStorage.removeItem(ACCESS_KEY)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    else if (refreshToken === null && !accessToken) localStorage.removeItem(REFRESH_KEY)
    else if (typeof refreshToken === "string") localStorage.setItem(REFRESH_KEY, refreshToken)
    set({
      accessToken,
      refreshToken:
        refreshToken === undefined
          ? useSessionStore.getState().refreshToken
          : refreshToken,
    })
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    set({ accessToken: null, refreshToken: null, user: null })
  },
}))

export function persistAuthTokens(accessToken: string, refreshToken: string) {
  useSessionStore.getState().setTokens(accessToken, refreshToken)
}
