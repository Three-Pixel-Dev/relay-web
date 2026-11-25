import { apiClient } from "@/app/api/client"

interface PinterestAuthUrl {
  authorizationUrl: string
  state: string
}

export async function startPinterestConnect() {
  const { data } = await apiClient.post<PinterestAuthUrl>("/pinterest/oauth/start")
  return data
}
