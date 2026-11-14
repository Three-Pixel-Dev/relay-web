import { OUTREACH_DEFAULT } from "@/shared/services/mock/catalog"
import type {
  OutreachTemplate,
  Partner,
  Product,
  ScoutResult,
  Workspace,
} from "@/shared/types/relay"

const KEY = "relay-app"

export interface MockState {
  workspace: Workspace
  products: Product[]
  partners: Partner[]
  scout: ScoutResult[]
  outreach: OutreachTemplate
}

const DEFAULT_STATE: MockState = {
  workspace: {
    sub: null,
    role: "user",
    seen: { onboard: false },
    services: {},
  },
  products: [],
  partners: [],
  scout: [],
  outreach: { ...OUTREACH_DEFAULT },
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULT_STATE)
    const parsed = JSON.parse(raw) as Partial<MockState> & {
      sub?: Workspace["sub"]
      role?: Workspace["role"]
      seen?: Workspace["seen"]
      services?: Workspace["services"]
    }
    if (parsed.workspace) {
      return {
        workspace: {
          ...DEFAULT_STATE.workspace,
          ...parsed.workspace,
          seen: { ...DEFAULT_STATE.workspace.seen, ...parsed.workspace.seen },
        },
        products: parsed.products ?? [],
        partners: parsed.partners ?? [],
        scout: parsed.scout ?? [],
        outreach: { ...OUTREACH_DEFAULT, ...parsed.outreach },
      }
    }
    return {
      workspace: {
        sub: parsed.sub ?? null,
        role: parsed.role ?? "user",
        seen: { onboard: parsed.seen?.onboard ?? false },
        services: parsed.services ?? {},
      },
      products: parsed.products ?? [],
      partners: parsed.partners ?? [],
      scout: parsed.scout ?? [],
      outreach: { ...OUTREACH_DEFAULT, ...parsed.outreach },
    }
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}

let state = load()
const listeners = new Set<() => void>()

export function getState() {
  return state
}

export function persist() {
  const payload = {
    ...state.workspace,
    products: state.products,
    partners: state.partners,
    scout: state.scout,
    outreach: state.outreach,
    workspace: state.workspace,
  }
  localStorage.setItem(KEY, JSON.stringify(payload))
  listeners.forEach((listener) => listener())
}

export function patchState(updater: (draft: MockState) => void) {
  updater(state)
  persist()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function cloneProduct(product: Product): Product {
  return structuredClone(product)
}
