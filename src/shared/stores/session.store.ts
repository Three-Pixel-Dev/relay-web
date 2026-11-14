import { create } from "zustand"

interface SessionState {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: localStorage.getItem("relay-access-token"),
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem("relay-access-token", token)
    } else {
      localStorage.removeItem("relay-access-token")
    }
    set({ accessToken: token })
  },
}))
