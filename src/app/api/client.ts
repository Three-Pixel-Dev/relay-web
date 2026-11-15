import axios, { type AxiosAdapter } from "axios"

import { mockAdapter } from "@/app/api/mock-adapter"
import { env } from "@/app/config/env"

const defaultHttpAdapter = axios.getAdapter(axios.defaults.adapter)

const hybridAdapter: AxiosAdapter = async (config) => {
  if (!env.apiBaseUrl) {
    return mockAdapter(config)
  }
  const rawUrl = config.url ?? "/"
  const path = new URL(rawUrl, "http://relay.local").pathname.replace(/\/$/, "") || "/"
  const isBackendRoute =
    path === "/products" ||
    path.startsWith("/products/") ||
    path === "/workspace" ||
    path.startsWith("/workspace/") ||
    path.startsWith("/auth/")

  if (!isBackendRoute) {
    return mockAdapter(config)
  }

  const response = await defaultHttpAdapter(config)
  const payload = response.data
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    response.data = (payload as { data: unknown }).data
  }
  return response
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  adapter: env.apiBaseUrl ? hybridAdapter : mockAdapter,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("relay-access-token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
