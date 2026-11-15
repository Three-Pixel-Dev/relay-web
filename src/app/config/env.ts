export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  /** When true (default), product mock APIs stay on; auth/subscription always hit the live backend. */
  useMock: (import.meta.env.VITE_USE_MOCK ?? "true") !== "false",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
}
