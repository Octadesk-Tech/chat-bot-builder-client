import type { IdMap } from 'models'

export const buildBlockIndexById = (
  blocks: { id: string }[]
): Map<string, number> => {
  const map = new Map<string, number>()
  blocks.forEach((block, index) => map.set(block.id, index))
  return map
}

export const omitFromIdMap = <T>(map: IdMap<T>, id: string): IdMap<T> => {
  if (!(id in map)) return map
  const next = { ...map }
  delete next[id]
  return next
}
