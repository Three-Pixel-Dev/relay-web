import { apiClient } from "@/app/api/client"

interface GmailAuthUrl {
  authorizationUrl: string
  state: string
}

export async function startGmailConnect() {
  const { data } = await apiClient.post<GmailAuthUrl>("/gmail/oauth/start")
  return data
}
