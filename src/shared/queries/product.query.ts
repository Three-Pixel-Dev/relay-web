import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { env } from "@/app/config/env"
import {
  addProductSection,
  addProductSources,
  approveProductStep,
  approvePromote,
  approveWeekBatch,
  cancelProduct,
  chooseProductPocket,
  chooseProductType,
  createProduct,
  deleteProduct,
  ensurePublishIntro,
  getProduct,
  listProducts,
  proceedProduct,
  publishProceed,
  publishSkip,
  publishSuggest,
  redoPromote,
  removeProductSection,
  removeProductSource,
  resumeProduct,
  schedulePromote,
  setListingPrice,
  setPublishPlatforms,
  startPromote,
  suggestProductChange,
  turnChannelOff,
  turnChannelOn,
  updateProductBrand,
} from "@/shared/services/product.service"
import type { CreateProductInput, Product, SourceItem } from "@/shared/types/relay"

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
}

function isBusy(product?: Product) {
  if (!product) return false
  if (product.stage === "build" && product.steps[product.cur]?.status === "running") return true
  if (product.publish.status === "running") return true
  if (product.promote.status === "running") return true
  if (Object.values(product.distribute).some((channel) => channel.setting)) return true
  return false
}

export function useProductsQuery() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: listProducts,
  })
}

export function useProductQuery(id: string | undefined) {
  const pollIntervalMs = env.apiBaseUrl ? 800 : 250
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => getProduct(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => (isBusy(query.state.data) ? pollIntervalMs : false),
  })
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
    onSuccess: () => {
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

export function useChoosePocketMutation() {
  return useProductMutation(({ id, index }: { id: string; index: number }) =>
    chooseProductPocket(id, index)
  )
}

export function useChooseTypeMutation() {
  return useProductMutation(({ id, typeId }: { id: string; typeId: string }) =>
    chooseProductType(id, typeId)
  )
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

export function useAddSectionMutation() {
  return useProductMutation(({ id, title }: { id: string; title: string }) =>
    addProductSection(id, title)
  )
}

export function useRemoveSectionMutation() {
  return useProductMutation(({ id, index }: { id: string; index: number }) =>
    removeProductSection(id, index)
  )
}

export function useUpdateBrandMutation() {
  return useProductMutation(
    ({
      id,
      ...patch
    }: { id: string } & Partial<{ palette: number; cover: number; title: string }>) =>
      updateProductBrand(id, patch)
  )
}

export function useEnsurePublishIntroMutation() {
  return useProductMutation((id: string) => ensurePublishIntro(id))
}

export function useSetPlatformsMutation() {
  return useProductMutation(({ id, platforms }: { id: string; platforms: string[] }) =>
    setPublishPlatforms(id, platforms)
  )
}

export function usePublishProceedMutation() {
  return useProductMutation((id: string) => publishProceed(id))
}

export function usePublishSuggestMutation() {
  return useProductMutation(({ id, text }: { id: string; text: string }) =>
    publishSuggest(id, text)
  )
}

export function usePublishSkipMutation() {
  return useProductMutation((id: string) => publishSkip(id))
}

export function useSetListingPriceMutation() {
  return useProductMutation(
    ({ id, platform, price }: { id: string; platform: string; price: number }) =>
      setListingPrice(id, platform, price)
  )
}

export function useChannelOnMutation() {
  return useProductMutation(({ id, channelId }: { id: string; channelId: string }) =>
    turnChannelOn(id, channelId)
  )
}

export function useChannelOffMutation() {
  return useProductMutation(({ id, channelId }: { id: string; channelId: string }) =>
    turnChannelOff(id, channelId)
  )
}

export function useWeekBatchMutation() {
  return useProductMutation((id: string) => approveWeekBatch(id))
}

export function useStartPromoteMutation() {
  return useProductMutation((id: string) => startPromote(id))
}

export function useApprovePromoteMutation() {
  return useProductMutation((id: string) => approvePromote(id))
}

export function useRedoPromoteMutation() {
  return useProductMutation((id: string) => redoPromote(id))
}

export function useSchedulePromoteMutation() {
  return useProductMutation((id: string) => schedulePromote(id))
}
