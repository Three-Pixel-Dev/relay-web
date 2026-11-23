import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { subscribeProductEvents } from "@/shared/services/product-events"
import {
  addProductSources,
  addSection,
  approveProductStep,
  cancelProduct,
  continueDespiteQuality,
  createProduct,
  deleteProduct,
  generateListingDraft,
  getProduct,
  listProducts,
  patchProductPocket,
  patchProductType,
  proceedProduct,
  publishToWhop,
  regenerateSection,
  removeProductSource,
  removeSection,
  renameProduct,
  resumeProduct,
  suggestProductChange,
  updateBrand,
} from "@/shared/services/product.service"
import type { PublishToWhopInput } from "@/shared/services/product.service"
import { useUiStore } from "@/shared/stores/ui.store"
import type {
  CreateProductInput,
  Product,
  ProductSelectionResponse,
  SourceItem,
  StepStatus,
} from "@/shared/types/relay"

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

export function useRenameProductMutation() {
  return useProductMutation(({ id, name }: { id: string; name: string }) =>
    renameProduct(id, name)
  )
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

const selectionSeqByKey = new Map<string, number>()

function nextSelectionSeq(key: string): number {
  const next = (selectionSeqByKey.get(key) ?? 0) + 1
  selectionSeqByKey.set(key, next)
  return next
}

function isLatestSelectionSeq(key: string, seq: number): boolean {
  return selectionSeqByKey.get(key) === seq
}

function applyStepsForSelection(product: Product, cur: number, stepStatus: StepStatus) {
  return product.steps.map((step, idx) => {
    if (idx < cur) {
      return { ...step, status: "done" as StepStatus, progress: null }
    }
    if (idx === cur) {
      return { ...step, status: stepStatus, progress: null }
    }
    return { ...step, status: "todo" as StepStatus, progress: null }
  })
}

function mergeSelectionIntoProduct(prev: Product, sel: ProductSelectionResponse): Product {
  const matchedPocket =
    sel.pocketId != null
      ? prev.pockets.find((p) => p.id === sel.pocketId) ?? prev.pocket
      : null
  return {
    ...prev,
    pocket: matchedPocket,
    type: sel.type ? sel.type.toLowerCase() : null,
    cur: sel.cur,
    steps: applyStepsForSelection(prev, sel.cur, sel.stepStatus),
  }
}

export function usePatchProductPocketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, pocketId }: { id: string; pocketId: string }) =>
      patchProductPocket(id, pocketId),
    onMutate: async (vars) => {
      const seqKey = `pocket:${vars.id}`
      const seq = nextSelectionSeq(seqKey)
      await queryClient.cancelQueries({ queryKey: productKeys.detail(vars.id) })
      const previous = queryClient.getQueryData<Product>(productKeys.detail(vars.id))
      if (previous) {
        const nextPocket = previous.pockets.find((p) => p.id === vars.pocketId) ?? previous.pocket
        queryClient.setQueryData<Product>(productKeys.detail(vars.id), {
          ...previous,
          pocket: nextPocket,
          typePriceSuggestions: undefined,
          cur: 1,
          steps: applyStepsForSelection(previous, 1, "review"),
        })
      }
      return { previous, seq, seqKey }
    },
    onError: (error, vars, context) => {
      if (context?.previous && isLatestSelectionSeq(context.seqKey, context.seq)) {
        queryClient.setQueryData(productKeys.detail(vars.id), context.previous)
      }
      const message = error instanceof Error && error.message ? error.message : "Could not save pocket selection."
      useUiStore.getState().showToast(message)
    },
    onSuccess: (sel, vars, context) => {
      if (context && !isLatestSelectionSeq(context.seqKey, context.seq)) {
        return
      }
      queryClient.setQueryData<Product>(productKeys.detail(vars.id), (prev) =>
        prev
          ? {
              ...mergeSelectionIntoProduct(prev, sel),
              typePriceSuggestions: undefined,
            }
          : prev
      )
    },
  })
}

export function usePatchProductTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, typeId }: { id: string; typeId: string }) =>
      patchProductType(id, typeId),
    onMutate: async (vars) => {
      const seqKey = `type:${vars.id}`
      const seq = nextSelectionSeq(seqKey)
      await queryClient.cancelQueries({ queryKey: productKeys.detail(vars.id) })
      const previous = queryClient.getQueryData<Product>(productKeys.detail(vars.id))
      if (previous) {
        queryClient.setQueryData<Product>(productKeys.detail(vars.id), {
          ...previous,
          type: vars.typeId,
          cur: 2,
          steps: applyStepsForSelection(previous, 2, "review"),
        })
      }
      return { previous, seq, seqKey }
    },
    onError: (error, vars, context) => {
      if (context?.previous && isLatestSelectionSeq(context.seqKey, context.seq)) {
        queryClient.setQueryData(productKeys.detail(vars.id), context.previous)
      }
      const message = error instanceof Error && error.message ? error.message : "Could not save product type."
      useUiStore.getState().showToast(message)
    },
    onSuccess: (sel, vars, context) => {
      if (context && !isLatestSelectionSeq(context.seqKey, context.seq)) {
        return
      }
      queryClient.setQueryData<Product>(productKeys.detail(vars.id), (prev) =>
        prev ? mergeSelectionIntoProduct(prev, sel) : prev
      )
    },
  })
}

export function useChoosePocketMutation() {
  return usePatchProductPocketMutation()
}

export function useChooseTypeMutation() {
  return usePatchProductTypeMutation()
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      title,
      cover,
    }: {
      id: string
      title?: string
      cover?: number
    }) => updateBrand(id, { title, cover }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(vars.id) })
      const previous = queryClient.getQueryData<Product>(productKeys.detail(vars.id))
      if (previous?.brand) {
        queryClient.setQueryData<Product>(productKeys.detail(vars.id), {
          ...previous,
          brand: {
            ...previous.brand,
            title: vars.title ?? previous.brand.title,
            cover: vars.cover ?? previous.brand.cover,
          },
        })
      }
      return { previous }
    },
    onError: (_error, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productKeys.detail(vars.id), context.previous)
      }
    },
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useSuggestProductMutation() {
  return useProductMutation(({ id, text }: { id: string; text: string }) =>
    suggestProductChange(id, text)
  )
}

export function useListingDraftMutation() {
  return useMutation({
    mutationFn: (id: string) => generateListingDraft(id),
  })
}

export function useWhopPublishMutation() {
  return useProductMutation(({ id, ...input }: { id: string } & PublishToWhopInput) =>
    publishToWhop(id, input)
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
