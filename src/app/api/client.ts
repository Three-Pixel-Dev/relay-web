import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios"

import { mockAdapter } from "@/app/api/mock-adapter"
import { env } from "@/app/config/env"

function pathOf(config: InternalAxiosRequestConfig) {
  const raw = config.url ?? "/"
  try {
    return new URL(raw, "http://relay.local").pathname.replace(/\/$/, "") || "/"
  } catch {
    return (raw.split("?")[0] || "/").replace(/\/$/, "") || "/"
  }
}

/** Live Spring routes: auth/billing from main, products/workspace from Sources work. */
function isLiveBackendPath(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/api/subscription") ||
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/workspace" ||
    pathname.startsWith("/workspace/")
  )
}

/** product.service expects unwrapped data; auth/subscription unwrap in their own services. */
function shouldUnwrapEnvelope(pathname: string) {
  return (
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/workspace" ||
    pathname.startsWith("/workspace/")
  )
}

const xhrAdapter = axios.getAdapter("xhr")

const hybridAdapter: AxiosAdapter = async (config) => {
  const pathname = pathOf(config)
  if (env.useMock && !isLiveBackendPath(pathname)) {
    return mockAdapter(config)
  }
  const response = await xhrAdapter(config)
  if (shouldUnwrapEnvelope(pathname)) {
    const payload = response.data
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      response.data = (payload as { data: unknown }).data
    }
  }
  return response
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
