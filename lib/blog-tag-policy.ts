export function normalizeBlogTag(tag: string): string {
  try {
    return decodeURIComponent(tag).trim().toLowerCase()
  } catch {
    return tag.trim().toLowerCase()
  }
}
