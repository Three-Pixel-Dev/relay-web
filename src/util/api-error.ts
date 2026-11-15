import axios from "axios"

export function apiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as {
      message?: string
      code?: string
      service?: string
      meta?: { code?: string; service?: string }
    }
    return {
      message: data.message ?? error.message,
      code: data.code ?? data.meta?.code,
      service: data.service ?? data.meta?.service,
    }
  }
  if (error instanceof Error) return { message: error.message }
  return { message: "Something went wrong." }
}
