import axios from "axios"

export function apiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as {
      message?: string
      code?: string | number
      service?: string
    }
    return {
      message: data.message ?? error.message,
      code: data.code != null ? String(data.code) : undefined,
      service: data.service,
    }
  }
  if (error instanceof Error) return { message: error.message }
  return { message: "Something went wrong." }
}
