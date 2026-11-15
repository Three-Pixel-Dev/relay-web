import { env } from "@/app/config/env"
import type { Product, StepStatus } from "@/shared/types/relay"

export interface ProductProgressEvent {
  progress: string[]
  stepStatus: StepStatus
}

export interface ProductEventsHandlers {
  onSnapshot?: (product: Product) => void
  onProgress?: (payload: ProductProgressEvent) => void
  onProduct?: (product: Product) => void
  onError?: (error: { message: string }) => void
}

export function subscribeProductEvents(
  id: string,
  handlers: ProductEventsHandlers
): () => void {
  const controller = new AbortController()
  const base = (env.apiBaseUrl || "/api").replace(/\/$/, "")
  const token = localStorage.getItem("relay-access-token")

  void (async () => {
    try {
      const response = await fetch(`${base}/products/${encodeURIComponent(id)}/events`, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        handlers.onError?.({
          message: `SSE stream failed with status ${response.status}`,
        })
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (!controller.signal.aborted) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n")

        let boundary = buffer.indexOf("\n\n")
        while (boundary !== -1) {
          const rawFrame = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          boundary = buffer.indexOf("\n\n")

          const shouldClose = dispatchFrame(rawFrame, handlers)
          if (shouldClose) {
            controller.abort()
            return
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }
      handlers.onError?.({
        message: error instanceof Error ? error.message : "SSE connection error",
      })
    }
  })()

  return () => {
    controller.abort()
  }
}

function dispatchFrame(rawFrame: string, handlers: ProductEventsHandlers): boolean {
  const lines = rawFrame.split("\n")
  let eventName = "message"
  const dataLines: string[] = []

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue
    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim()
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim())
    }
  }

  if (dataLines.length === 0) return false
  const rawData = dataLines.join("\n")

  try {
    const parsed = JSON.parse(rawData)
    if (eventName === "snapshot") {
      handlers.onSnapshot?.(parsed as Product)
      return false
    }
    if (eventName === "progress") {
      handlers.onProgress?.(parsed as ProductProgressEvent)
      return false
    }
    if (eventName === "product") {
      handlers.onProduct?.(parsed as Product)
      return true
    }
    if (eventName === "error") {
      handlers.onError?.(parsed as { message: string })
      return true
    }
  } catch {
    // Ignore malformed JSON frames
  }
  return false
}

