import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { subscribeProductEvents } from "@/shared/services/product-events"
import {
  addProductSources,
  addSection,
  approveProductStep,
  cancelProduct,
  choosePocket,
  chooseType,
  continueDespiteQuality,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  proceedProduct,
  regenerateSection,
  removeProductSource,
  removeSection,
  resumeProduct,
  suggestProductChange,
  updateBrand,
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
        queryClient.setQueryData<Product[]>(productKeys.lists(), (prev) =>
          prev ? prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)) : prev
        )
        const stillRunning =
          updatedProduct.stage === "build" &&
          updatedProduct.steps[updatedProduct.cur]?.status === "running"
        if (!stillRunning) {
          void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
        }
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

export function useContinueQualityProductMutation() {
  return useProductMutation((id: string) => continueDespiteQuality(id))
}

export function useApproveProductMutation() {
  return useProductMutation((id: string) => approveProductStep(id))
}

export function useChoosePocketMutation() {
  return useProductMutation(({ id, pocketId }: { id: string; pocketId: string }) =>
    choosePocket(id, pocketId)
  )
}

export function useChooseTypeMutation() {
  return useProductMutation(({ id, typeId }: { id: string; typeId: string }) =>
    chooseType(id, typeId)
  )
}

export function useAddSectionMutation() {
  return useProductMutation(({ id, title }: { id: string; title: string }) =>
    addSection(id, title)
  )
}

export function useRemoveSectionMutation() {
  return useProductMutation(({ id, sectionId }: { id: string; sectionId: string }) =>
    removeSection(id, sectionId)
  )
}

export function useRegenerateSectionMutation() {
  return useProductMutation(({ id, sectionId }: { id: string; sectionId: string }) =>
    regenerateSection(id, sectionId)
  )
}

export function useUpdateBrandMutation() {
  return useProductMutation(
    ({
      id,
      title,
      palette,
      cover,
    }: {
      id: string
      title?: string
      palette?: number
      cover?: number
    }) => updateBrand(id, { title, palette, cover })
  )
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
