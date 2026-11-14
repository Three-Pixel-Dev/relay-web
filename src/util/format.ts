export function money(value: number) {
  const amount = Number(value || 0)
  return `$${amount.toFixed(amount % 1 ? 2 : 0)}`
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export function pagesCount(words: number, sections: number) {
  return Math.max(4, Math.round(words / 320) + sections + 2)
}
