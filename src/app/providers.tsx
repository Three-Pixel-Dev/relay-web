import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import type { ReactNode } from "react"

import { AppModal } from "@/components/common/app-modal"
import { AppToast } from "@/components/common/app-toast"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AppModal />
      <AppToast />
    </QueryClientProvider>
  )
}
