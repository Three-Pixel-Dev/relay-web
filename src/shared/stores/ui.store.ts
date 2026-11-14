import { create } from "zustand"

import type { ReactNode } from "react"

export interface ModalSpec {
  title: string
  body: ReactNode
  actions?: ReactNode
  wide?: boolean
}

interface UiState {
  toast: string | null
  modal: ModalSpec | null
  showToast: (message: string) => void
  openModal: (modal: ModalSpec) => void
  closeModal: () => void
}

let toastTimer: number | undefined

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  modal: null,
  showToast: (message) => {
    window.clearTimeout(toastTimer)
    set({ toast: message })
    toastTimer = window.setTimeout(() => set({ toast: null }), 2800)
  },
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}))
