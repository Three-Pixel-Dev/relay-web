import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios"

import { getCatalog } from "@/shared/services/mock/catalog"
import * as engine from "@/shared/services/mock/engine"

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config,
  }
}

function parseBody(config: InternalAxiosRequestConfig) {
  if (config.data == null || config.data === "") return undefined
  if (typeof config.data === "string") return JSON.parse(config.data)
  return config.data
}

function match(path: string, pattern: string) {
  const pathParts = path.split("/").filter(Boolean)
  const patternParts = pattern.split("/").filter(Boolean)
  if (pathParts.length !== patternParts.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i += 1) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

export const mockAdapter: AxiosAdapter = async (config) => {
  try {
    return await dispatch(config)
  } catch (error) {
    const err = error as Error & { code?: string; service?: string }
    return {
      data: { message: err.message, code: err.code, service: err.service },
      status: err.code === "SUB_REQUIRED" || err.code === "CONNECT" ? 409 : 400,
      statusText: "Error",
      headers: {},
      config,
    }
  }
}

async function dispatch(config: InternalAxiosRequestConfig) {
  const method = (config.method ?? "get").toLowerCase()
  const url = new URL(config.url ?? "/", "http://relay.local")
  const path = url.pathname.replace(/\/$/, "") || "/"
  const body = parseBody(config)

  const route = (pattern: string) => match(path, pattern)

  if (method === "get" && path === "/catalog") return ok(config, getCatalog())
  if (method === "get" && path === "/workspace") return ok(config, engine.listWorkspace())
  if (method === "post" && path === "/workspace/onboard") {
    return ok(config, engine.markOnboarded())
  }
  if (method === "post" && path === "/workspace/subscription") {
    return ok(config, engine.startSubscription(body.plan))
  }

  let params = route("/workspace/services/:id/connect")
  if (method === "post" && params) {
    return ok(config, engine.connectService(params.id, body.label))
  }
  params = route("/workspace/services/:id")
  if (method === "delete" && params) {
    return ok(config, engine.disconnectService(params.id))
  }

  if (method === "get" && path === "/products") return ok(config, engine.listProducts())
  if (method === "post" && path === "/products") return ok(config, engine.createProduct(body), 201)

  params = route("/products/:id")
  if (params && method === "get") return ok(config, engine.getProduct(params.id))
  if (params && method === "delete") {
    engine.deleteProduct(params.id)
    return ok(config, { ok: true })
  }

  params = route("/products/:id/sources")
  if (params && method === "post") return ok(config, engine.addSources(params.id, body.sources))

  params = route("/products/:id/sources/upload")
  if (params && method === "post") {
    const formData = config.data instanceof FormData ? config.data : null
    const uploaded: { id: string; kind: "file"; name: string; size: number }[] = []
    if (formData) {
      for (const value of formData.getAll("files")) {
        if (value instanceof File) {
          uploaded.push({
            id: `s${Math.random().toString(36).slice(2, 8)}`,
            kind: "file",
            name: value.name,
            size: value.size,
          })
        }
      }
    }
    return ok(config, engine.addSources(params.id, uploaded))
  }

  params = route("/products/:id/sources/:sourceId")
  if (params && method === "delete") {
    return ok(config, engine.removeSource(params.id, params.sourceId))
  }

  params = route("/products/:id/proceed")
  if (params && method === "post") return ok(config, await engine.proceedProduct(params.id))
  params = route("/products/:id/approve")
  if (params && method === "post") return ok(config, engine.approveStep(params.id))
  params = route("/products/:id/suggest")
  if (params && method === "post") return ok(config, engine.suggestChange(params.id, body.text))
  params = route("/products/:id/cancel")
  if (params && method === "post") return ok(config, engine.cancelProduct(params.id))
  params = route("/products/:id/resume")
  if (params && method === "post") return ok(config, engine.resumeProduct(params.id))
  params = route("/products/:id/pocket")
  if (params && method === "post") return ok(config, engine.choosePocket(params.id, body.index))
  params = route("/products/:id/type")
  if (params && method === "post") return ok(config, engine.chooseType(params.id, body.typeId))
  params = route("/products/:id/structure")
  if (params && method === "post") return ok(config, engine.addSection(params.id, body.title))
  params = route("/products/:id/structure/:index")
  if (params && method === "delete") {
    return ok(config, engine.removeSection(params.id, Number(params.index)))
  }
  params = route("/products/:id/brand")
  if (params && method === "patch") return ok(config, engine.updateBrand(params.id, body))

  params = route("/products/:id/publish/intro")
  if (params && method === "post") return ok(config, engine.ensurePublishIntro(params.id))
  params = route("/products/:id/publish/platforms")
  if (params && method === "post") {
    return ok(config, engine.setPublishPlatforms(params.id, body.platforms))
  }
  params = route("/products/:id/publish/proceed")
  if (params && method === "post") return ok(config, await engine.publishProceed(params.id))
  params = route("/products/:id/publish/suggest")
  if (params && method === "post") return ok(config, engine.publishSuggest(params.id, body.text))
  params = route("/products/:id/publish/skip")
  if (params && method === "post") return ok(config, engine.publishSkip(params.id))
  params = route("/products/:id/listings/:platform")
  if (params && method === "patch") {
    return ok(config, engine.setListingPrice(params.id, params.platform, body.price))
  }

  params = route("/products/:id/channels/:channelId/on")
  if (params && method === "post") return ok(config, await engine.channelOn(params.id, params.channelId))
  params = route("/products/:id/channels/:channelId")
  if (params && method === "delete") {
    return ok(config, engine.channelOff(params.id, params.channelId))
  }
  params = route("/products/:id/week-batch")
  if (params && method === "post") return ok(config, engine.weekBatch(params.id))

  params = route("/products/:id/promote/start")
  if (params && method === "post") return ok(config, await engine.promoStart(params.id))
  params = route("/products/:id/promote/approve")
  if (params && method === "post") return ok(config, await engine.promoApprove(params.id))
  params = route("/products/:id/promote/redo")
  if (params && method === "post") return ok(config, await engine.promoRedo(params.id))
  params = route("/products/:id/promote/schedule")
  if (params && method === "post") return ok(config, engine.promoSchedule(params.id))

  if (method === "get" && path === "/partners") return ok(config, engine.listPartners())
  if (method === "get" && path === "/partners/scout") return ok(config, engine.listScout())
  if (method === "get" && path === "/partners/outreach") return ok(config, engine.getOutreach())
  if (method === "patch" && path === "/partners/outreach") {
    return ok(config, engine.updateOutreach(body))
  }
  if (method === "post" && path === "/partners/scout") {
    return ok(config, await engine.runScout(body.query, body.platforms))
  }
  if (method === "post" && path === "/partners/from-scout") {
    return ok(config, engine.addScoutToList(body.handles))
  }
  if (method === "post" && path === "/partners/own-list") {
    return ok(config, engine.addOwnList(body.lines))
  }
  if (method === "post" && path === "/partners/send") {
    return ok(config, await engine.sendOutreach())
  }
  params = route("/partners/:id")
  if (params && method === "delete") return ok(config, engine.removePartner(params.id))
  params = route("/partners/:id/status")
  if (params && method === "post") return ok(config, engine.markPartner(params.id, body.status))
  params = route("/partners/:id/build")
  if (params && method === "post") return ok(config, engine.buildForPartner(params.id, body.mode))

  if (method === "get" && path === "/admin/stats") return ok(config, engine.adminStats())

  return ok(config, { message: `No mock for ${method} ${path}` }, 404)
}
