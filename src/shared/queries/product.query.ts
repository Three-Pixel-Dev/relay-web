import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { subscribeProductEvents } from "@/shared/services/product-events"
import {
  addProductSources,
  approveProductStep,
  cancelProduct,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  proceedProduct,
  removeProductSource,
  resumeProduct,
  suggestProductChange,
} from "@/shared/services/product.service"
import type { CreateProductInput, Product, SourceItem } from "@/shared/types/relay"

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
}

export function useProductsQuery() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: listProducts,
  })
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => getProduct(id!),
    enabled: Boolean(id),
  })
}

export function useProductEvents(id: string | undefined, isRunning: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!id || !isRunning) return

    const unsubscribe = subscribeProductEvents(id, {
      onSnapshot: (snapshot) => {
        queryClient.setQueryData(productKeys.detail(id), snapshot)
      },
      onProgress: ({ progress, stepStatus }) => {
        queryClient.setQueryData<Product>(productKeys.detail(id), (prev) => {
          if (!prev) return prev
          const cur = prev.cur
          const nextSteps = prev.steps.map((step, idx) =>
            idx === cur
              ? {
                  ...step,
                  status: stepStatus ?? "running",
                  progress,
                }
              : step
          )
          return {
            ...prev,
            steps: nextSteps,
          }
        })
      },
      onProduct: (updatedProduct) => {
        queryClient.setQueryData(productKeys.detail(id), updatedProduct)
        void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      },
      onError: () => {
        // Fallback single refetch if SSE stream drops unexpectedly
        void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      },
    })

    return () => {
      unsubscribe()
    }
  }, [id, isRunning, queryClient])
}

function useProductMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Product>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useProceedProductMutation() {
  return useProductMutation((id: string) => proceedProduct(id))
}

export function useApproveProductMutation() {
  return useProductMutation((id: string) => approveProductStep(id))
}

export function useSuggestProductMutation() {
  return useProductMutation(({ id, text }: { id: string; text: string }) =>
    suggestProductChange(id, text)
  )
}

export function useCancelProductMutation() {
  return useProductMutation((id: string) => cancelProduct(id))
}

export function useResumeProductMutation() {
  return useProductMutation((id: string) => resumeProduct(id))
}

export function useAddSourcesMutation() {
  return useProductMutation(({ id, sources }: { id: string; sources: SourceItem[] }) =>
    addProductSources(id, sources)
  )
}

export function useRemoveSourceMutation() {
  return useProductMutation(({ id, sourceId }: { id: string; sourceId: string }) =>
    removeProductSource(id, sourceId)
  )
}
