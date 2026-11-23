import { useState } from "react"

import { Spin } from "@/components/common/spin"
import { fieldClass, kvClass, labelClass, protoBtn } from "@/lib/proto"
import { useConnectServiceMutation } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { ServiceCatalogItem } from "@/shared/types/relay"
import { apiError } from "@/util/api-error"

interface ConnectModalBodyProps {
  service: ServiceCatalogItem
}

export function openConnectModal(service: ServiceCatalogItem) {
  const { openModal, showToast } = useUiStore.getState()
  if (service.kind === "guided") {
    showToast(`${service.name} has no API. Relay guides you when you publish.`)
    return
  }
  openModal({
    title: service.kind === "oauth" ? `Connect ${service.name}` : `Add your ${service.name} key`,
    body: <ConnectModalBody service={service} />,
  })
}

function keyLabel(serviceId: string) {
  if (serviceId === "llm" || serviceId === "img") return "Gemini API key"
  if (serviceId === "whop") return "Whop API key"
  return "API key"
}

function keyHelp(serviceId: string) {
  if (serviceId === "llm") {
    return "Paste a Google Gemini API key (starts with AIza… or AQ.…) so Relay can index your sources and write your product."
  }
  if (serviceId === "img") {
    return "Paste a Google Gemini API key (starts with AIza… or AQ.…) so Relay can generate custom covers and section graphics."
  }
  if (serviceId === "whop") {
    return "Create an API key in your Whop dashboard under Developer, with permission to manage products, plans and webhooks, then paste it here. Relay checks it and sets up sale tracking for you. Whop takes its own fee per sale."
  }
  return "Paste your provider API key below."
}

function ConnectModalBody({ service }: ConnectModalBodyProps) {
  const connect = useConnectServiceMutation()
  const closeModal = useUiStore((state) => state.closeModal)
  const showToast = useUiStore((state) => state.showToast)
  const [keyValue, setKeyValue] = useState("")

  const can =
    service.kind === "oauth"
      ? service.id === "gmail"
        ? "Send the emails you approve, read replies to them"
        : service.id === "whop"
          ? "Create products and checkout links, set affiliate and partner shares, read sales"
          : "Create and update listings, read stats"
      : ""
  const cannot =
    service.id === "gmail"
      ? "Read the rest of your inbox, send anything you did not approve"
      : "Change payouts, delete your account"

  function finish(label: string, credential?: string) {
    connect.mutate(
      { id: service.id, label, credential },
      {
        onError: (error) => showToast(apiError(error).message),
        onSuccess: () => {
          closeModal()
          showToast(`${service.name} connected.`)
        },
      }
    )
  }

  const actionsClass = "mt-[22px] flex flex-wrap justify-end gap-2.5"

  if (service.kind === "oauth") {
    return (
      <>
        <p className="mb-3.5 text-[13px] text-muted-foreground">
          {service.does} You’ll be sent to {service.name} to approve Relay.
        </p>
        <div className={kvClass}>
          <span className="text-muted-foreground">Relay can</span>
          <b>{can}</b>
        </div>
        <div className={kvClass}>
          <span className="text-muted-foreground">Relay cannot</span>
          <b>{cannot}</b>
        </div>
        <div className={kvClass}>
          <span className="text-muted-foreground">Their fee</span>
          <b>{service.price}</b>
        </div>
        <div className={actionsClass}>
          <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
            Cancel
          </button>
          <button
            type="button"
            className={protoBtn()}
            disabled={connect.isPending}
            onClick={() => finish("Connected")}
          >
            {connect.isPending ? <Spin /> : null} Continue to {service.name}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <p className="mb-3.5 text-[13px] text-muted-foreground">
        {service.does}{" "}
        {service.id === "whop" ? "" : `Billed by your provider at ${service.price.toLowerCase()}.`}{" "}
        {keyHelp(service.id)}
      </p>
      <div>
        <label className={labelClass} htmlFor="k1">
          {keyLabel(service.id)}
        </label>
        <input
          id="k1"
          className={fieldClass}
          type="password"
          placeholder={
            service.id === "llm" || service.id === "img"
              ? "AIza… or AQ.…"
              : service.id === "whop"
                ? "apik_…"
                : "sk-…"
          }
          value={keyValue}
          onChange={(event) => setKeyValue(event.target.value)}
        />
      </div>
      <div className={actionsClass}>
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button"
          className={protoBtn()}
          disabled={connect.isPending}
          onClick={() => {
            const trimmed = keyValue.trim()
            if (trimmed.length < 6) {
              showToast("Paste a key first.")
              return
            }
            if ((service.id === "llm" || service.id === "img") && trimmed.startsWith("sk-")) {
              showToast(
                "Requires a Google Gemini API key (AIza… or AQ.…), not an OpenAI sk-… key."
              )
              return
            }
            finish(`${trimmed.slice(0, 3)}••••${trimmed.slice(-3)}`, trimmed)
          }}
        >
          {connect.isPending ? <Spin /> : null} Test and save
        </button>
      </div>
    </>
  )
}
