import { apiClient } from "@/app/api/client"
import type { CreateProductInput, Product, SourceItem } from "@/shared/types/relay"

export async function listProducts() {
  const { data } = await apiClient.get<Product[]>("/products")
  return data
}

export async function getProduct(id: string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
}

export async function createProduct(input: CreateProductInput) {
  const { data } = await apiClient.post<Product>("/products", input)
  return data
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`)
}

export async function addProductSources(id: string, sources: SourceItem[]) {
  const { data } = await apiClient.post<Product>(`/products/${id}/sources`, { sources })
  return data
}

export async function removeProductSource(id: string, sourceId: string) {
  const { data } = await apiClient.delete<Product>(`/products/${id}/sources/${sourceId}`)
  return data
}

export async function proceedProduct(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/proceed`)
  return data
}

export async function approveProductStep(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/approve`)
  return data
}

export async function suggestProductChange(id: string, text: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/suggest`, { text })
  return data
}

export async function cancelProduct(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/cancel`)
  return data
}

export async function resumeProduct(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/resume`)
  return data
}

export async function chooseProductPocket(id: string, index: number) {
  const { data } = await apiClient.post<Product>(`/products/${id}/pocket`, { index })
  return data
}

export async function chooseProductType(id: string, typeId: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/type`, { typeId })
  return data
}

export async function addProductSection(id: string, title: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/structure`, { title })
  return data
}

export async function removeProductSection(id: string, index: number) {
  const { data } = await apiClient.delete<Product>(`/products/${id}/structure/${index}`)
  return data
}

export async function updateProductBrand(
  id: string,
  patch: Partial<{ palette: number; cover: number; title: string }>
) {
  const { data } = await apiClient.patch<Product>(`/products/${id}/brand`, patch)
  return data
}

export async function ensurePublishIntro(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish/intro`)
  return data
}

export async function setPublishPlatforms(id: string, platforms: string[]) {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish/platforms`, {
    platforms,
  })
  return data
}

export async function publishProceed(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish/proceed`)
  return data
}

export async function publishSuggest(id: string, text: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish/suggest`, { text })
  return data
}

export async function publishSkip(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish/skip`)
  return data
}

export async function setListingPrice(id: string, platform: string, price: number) {
  const { data } = await apiClient.patch<Product>(`/products/${id}/listings/${platform}`, {
    price,
  })
  return data
}

export async function turnChannelOn(id: string, channelId: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/channels/${channelId}/on`)
  return data
}

export async function turnChannelOff(id: string, channelId: string) {
  const { data } = await apiClient.delete<Product>(`/products/${id}/channels/${channelId}`)
  return data
}

export async function approveWeekBatch(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/week-batch`)
  return data
}

export async function startPromote(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/promote/start`)
  return data
}

export async function approvePromote(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/promote/approve`)
  return data
}

export async function redoPromote(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/promote/redo`)
  return data
}

export async function schedulePromote(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/promote/schedule`)
  return data
}
