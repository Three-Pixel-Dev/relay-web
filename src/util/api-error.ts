import axios from "axios"

export function apiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as {
      message?: string
      code?: string | number
      service?: string
      meta?: { code?: string | number; service?: string }
    }
    const rawCode = data.code ?? data.meta?.code
    return {
      message: data.message ?? error.message,
      code: rawCode != null ? String(rawCode) : undefined,
      service: data.service ?? data.meta?.service,
    }
  }
  if (error instanceof Error) return { message: error.message }
  return { message: "Something went wrong." }
}
