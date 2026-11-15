import { apiClient } from "@/app/api/client"
import type { ApiResponse, AuthTokens, MeUser } from "@/shared/types/api"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const { data } = await promise
  if (!data.success) {
    throw Object.assign(new Error(data.message || "Request failed"), { code: data.code })
  }
  return data.data
}

export async function signup(input: { email: string; password: string; name: string }) {
  return unwrap(apiClient.post<ApiResponse<AuthTokens>>("/auth/signup", input))
}

export async function login(input: { email: string; password: string }) {
  return unwrap(apiClient.post<ApiResponse<AuthTokens>>("/auth/login", input))
}

export async function loginWithGoogle(idToken: string) {
  return unwrap(apiClient.post<ApiResponse<AuthTokens>>("/auth/google", { idToken }))
}

export async function refreshToken(refreshTokenValue: string) {
  return unwrap(
    apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh-token", {
      refreshToken: refreshTokenValue,
    }),
  )
}

export async function fetchMe() {
  return unwrap(apiClient.get<ApiResponse<MeUser>>("/auth/me"))
}

export async function updateProfile(name: string) {
  return unwrap(apiClient.put<ApiResponse<MeUser>>("/auth/profile", { name }))
}

export async function logout() {
  return unwrap(apiClient.post<ApiResponse<{ message: string }>>("/auth/logout"))
}
