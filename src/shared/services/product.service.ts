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
  const allSources = input.sources ?? []
  const realFiles = allSources
    .filter((s) => s.kind === "file" && s.file instanceof File)
    .map((s) => s.file as File)
  const linkAndSampleSources = allSources
    .filter((s) => !(s.kind === "file" && s.file instanceof File))
    .map(({ file: _file, ...rest }) => rest)

  const { data } = await apiClient.post<Product>("/products", {
    ...input,
    sources: linkAndSampleSources,
    pendingFilesCount: realFiles.length,
  })

  if (realFiles.length > 0) {
    return await uploadProductSources(data.id, realFiles)
  }
  return data
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`)
}

export async function uploadProductSources(id: string, files: File[]) {
  const formData = new FormData()
  for (const file of files) {
    formData.append("files", file)
  }
  const { data } = await apiClient.post<Product>(`/products/${id}/sources/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function addProductSources(id: string, sources: SourceItem[]) {
  const realFiles = sources
    .filter((s) => s.kind === "file" && s.file instanceof File)
    .map((s) => s.file as File)
  const linkAndSampleSources = sources
    .filter((s) => !(s.kind === "file" && s.file instanceof File))
    .map(({ file: _file, ...rest }) => rest)

  let latest: Product | null = null
  if (linkAndSampleSources.length > 0) {
    const { data } = await apiClient.post<Product>(`/products/${id}/sources`, {
      sources: linkAndSampleSources,
    })
    latest = data
  }
  if (realFiles.length > 0) {
    latest = await uploadProductSources(id, realFiles)
  }
  if (latest) return latest
  return await getProduct(id)
}

export async function removeProductSource(id: string, sourceId: string) {
  const { data } = await apiClient.delete<Product>(`/products/${id}/sources/${sourceId}`)
  return data
}

export async function proceedProduct(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/proceed`)
  return data
}

export async function continueDespiteQuality(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/quality/continue`)
  return data
}

export async function approveProductStep(id: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/approve`)
  return data
}

export async function choosePocket(id: string, pocketId: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/pockets/${pocketId}/choose`)
  return data
}

export async function chooseType(id: string, typeId: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/types/${typeId}/choose`)
  return data
}

export async function addSection(id: string, title: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/sections`, { title })
  return data
}

export async function removeSection(id: string, sectionId: string) {
  const { data } = await apiClient.delete<Product>(`/products/${id}/sections/${sectionId}`)
  return data
}

export async function regenerateSection(id: string, sectionId: string) {
  const { data } = await apiClient.post<Product>(`/products/${id}/sections/${sectionId}/regenerate`)
  return data
}

export async function updateBrand(
  id: string,
  input: { title?: string; palette?: number; cover?: number }
) {
  const { data } = await apiClient.patch<Product>(`/products/${id}/brand`, input)
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

export async function downloadProductFile(
  productId: string,
  fileId: string,
  fallbackFilename = "download"
) {
  const response = await apiClient.get<Blob>(`/products/${productId}/files/${fileId}/download`, {
    responseType: "blob",
  })
  const disposition = String(response.headers?.["content-disposition"] ?? "")
  const match = disposition.match(/filename="?([^";]+)"?/i)
  const filename = match?.[1] || fallbackFilename
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
