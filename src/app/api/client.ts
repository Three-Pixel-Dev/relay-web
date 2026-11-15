import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios"

import { mockAdapter } from "@/app/api/mock-adapter"
import { env } from "@/app/config/env"

function pathOf(config: InternalAxiosRequestConfig) {
  const raw = config.url ?? "/"
  try {
    return new URL(raw, "http://relay.local").pathname
  } catch {
    return raw.split("?")[0] || "/"
  }
}

/** Auth + billing always talk to the Spring API; other routes can stay mocked. */
function isLiveBackendPath(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/api/subscription")
  )
}

const xhrAdapter = axios.getAdapter("xhr")

const hybridAdapter: AxiosAdapter = async (config) => {
  const pathname = pathOf(config)
  if (env.useMock && !isLiveBackendPath(pathname)) {
    return mockAdapter(config)
  }
  return xhrAdapter(config)
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  adapter: hybridAdapter,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("relay-access-token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
