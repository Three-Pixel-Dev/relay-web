import { apiClient } from "@/app/api/client"
import type { AuthTokens, MeUser } from "@/shared/types/api"

export async function signup(input: { email: string; password: string; name: string }) {
  const { data } = await apiClient.post<AuthTokens>("/auth/signup", input)
  return data
}

export async function login(input: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthTokens>("/auth/login", input)
  return data
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await apiClient.post<AuthTokens>("/auth/google", { idToken })
  return data
}

export async function refreshToken(refreshTokenValue: string) {
  const { data } = await apiClient.post<AuthTokens>("/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  })
  return data
}

export async function fetchMe() {
  const { data } = await apiClient.get<MeUser>("/auth/me")
  return data
}

export async function updateProfile(name: string) {
  const { data } = await apiClient.put<MeUser>("/auth/profile", { name })
  return data
}

export async function logout() {
  const { data } = await apiClient.post<{ message: string }>("/auth/logout")
  return data
}
