import { apiClient } from "@/app/api/client"

export type ReachPlatform = "youtube" | "tiktok" | "instagram"

interface ReachAuthUrl {
  authorizationUrl: string
  state: string
}

export async function startReachConnect(platform: ReachPlatform) {
  const { data } = await apiClient.post<ReachAuthUrl>(`/${platform}/oauth/start`)
  return data
}
