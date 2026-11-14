import axios from "axios"

import { mockAdapter } from "@/app/api/mock-adapter"
import { env } from "@/app/config/env"

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  adapter: mockAdapter,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("relay-access-token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
