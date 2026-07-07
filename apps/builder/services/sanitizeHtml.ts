import DOMPurify from 'dompurify'
import { textBubbleEditorContentConfig } from 'config/dompurify'

/**
 * Cache global de `DOMPurify.sanitize` para o conteúdo das bubbles.
 *
 * Os previews de texto (TextBubbleContent/TextHtmlContent) sanitizam HTML a cada
 * render/mount. Durante a navegação, blocos montam/desmontam o tempo todo
 * (virtualização) → o mesmo HTML é re-sanitizado repetidamente. O profile
 * mostrou isto como ~10-13% do tempo (parseFromString / purify / Parse HTML).
 *
 * A config é constante, então a chave é só a string de HTML. O cache sobrevive a
 * re-mounts, eliminando o custo ao panar de volta por blocos já vistos.
 */
const cache = new Map<string, string>()
const MAX_ENTRIES = 2000

export const sanitizeBubbleHtml = (html?: string): string => {
  const key = html ?? ''
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const sanitized = DOMPurify.sanitize(key, textBubbleEditorContentConfig)
  // Evita crescimento ilimitado (ex.: digitação gera muitas strings distintas).
  if (cache.size >= MAX_ENTRIES) cache.clear()
  cache.set(key, sanitized)
  return sanitized
}
