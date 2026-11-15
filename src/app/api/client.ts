import axios from "axios"

import { env } from "@/app/config/env"

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("relay-access-token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use((response) => {
  const payload = response.data
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload
  ) {
    const envelope = payload as {
      success: boolean
      message?: string
      code?: string | number
      data?: unknown
      meta?: { code?: string | number; service?: string }
    }
    if (!envelope.success) {
      const rawCode = envelope.code ?? envelope.meta?.code
      throw Object.assign(new Error(envelope.message || "Request failed"), {
        code: rawCode != null ? String(rawCode) : undefined,
        service: envelope.meta?.service,
      })
    }
    if ("data" in envelope) {
      response.data = envelope.data
    }
  }
  return response
})
