// CHAT-1630 — pure canvas helpers. Kept dependency-free (only the IdMap type from models)
// so it can be imported by both GraphContent and GraphContext without a circular dependency
// (services/graph.ts already imports from GraphContext, so the helpers can't live there).
import type { IdMap } from 'models'

// O(1) block index lookup, memoized on blocks in GraphContent, replacing a findIndex per
// visible block on every render. Equivalent to blocks.findIndex(b => b.id === id) for the
// unique block ids the builder produces (cuid).
export const buildBlockIndexById = (
  blocks: { id: string }[]
): Map<string, number> => {
  const map = new Map<string, number>()
  blocks.forEach((block, index) => map.set(block.id, index))
  return map
}

// Immutably remove a key from an IdMap. Returns the SAME reference if the key is absent,
// so a no-op removal does not trigger a needless re-render. Used to drop endpoints when
// their node unmounts (culling), preventing stale refs that break edge rendering.
export const omitFromIdMap = <T>(map: IdMap<T>, id: string): IdMap<T> => {
  if (!(id in map)) return map
  const next = { ...map }
  delete next[id]
  return next
}
