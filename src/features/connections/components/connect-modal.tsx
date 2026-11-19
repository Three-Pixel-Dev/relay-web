import { useState } from "react"

import { Spin } from "@/components/common/spin"
import { fieldClass, kvClass, labelClass, protoBtn } from "@/lib/proto"
import { useConnectServiceMutation } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { ServiceCatalogItem } from "@/shared/types/relay"

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
        {service.does} Billed by your provider at {service.price.toLowerCase()}.{" "}
        {service.id === "llm"
          ? "Paste a Google Gemini API key (starts with AIza…) so Relay can embed your sources and generate summaries."
          : "Paste your provider API key below."}
      </p>
      <div>
        <label className={labelClass} htmlFor="k1">
          {service.id === "llm" ? "Gemini API key" : "API key"}
        </label>
        <input
          id="k1"
          className={fieldClass}
          type="password"
          placeholder={service.id === "llm" ? "AIza…" : "sk-…"}
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
            if (service.id === "llm" && trimmed.startsWith("sk-")) {
              showToast(
                "Source indexing requires a Google Gemini API key (AIza…), not an OpenAI sk-… key."
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
