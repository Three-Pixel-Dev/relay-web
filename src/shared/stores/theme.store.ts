import { create } from "zustand"

export type ThemeMode = "light" | "dark"

const STORAGE_KEY = "relayguy-mode"

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

function readStoredMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle("dark", mode === "dark")
  root.style.colorScheme = mode
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute("content", mode === "dark" ? "#0f0f10" : "#ffffff")
  }
}

function persistMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore quota / private mode */
  }
}

const initialMode = typeof document !== "undefined" ? readStoredMode() : "light"
if (typeof document !== "undefined") {
  applyMode(initialMode)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  setMode: (mode) => {
    applyMode(mode)
    persistMode(mode)
    set({ mode })
  },
  toggle: () => {
    const next = get().mode === "dark" ? "light" : "dark"
    get().setMode(next)
  },
}))
