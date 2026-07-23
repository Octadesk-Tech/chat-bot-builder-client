import DOMPurify from 'dompurify'
import { textBubbleEditorContentConfig } from 'config/dompurify'

const cache = new Map<string, string>()
const MAX_ENTRIES = 2000

export const sanitizeBubbleHtml = (html?: string): string => {
  const key = html ?? ''
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const sanitized = DOMPurify.sanitize(key, textBubbleEditorContentConfig)
  if (cache.size >= MAX_ENTRIES) cache.clear()
  cache.set(key, sanitized)
  return sanitized
}
