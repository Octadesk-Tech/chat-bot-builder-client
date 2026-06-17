/*
 * CHAT-1630 / 306318 — coverage required by F6 forensic for Fase 2A + Fase 3.
 *  - buildBlockIndexById must be EQUIVALENT to blocks.findIndex (so the `?? 0` fallback in
 *    GraphContent is never reached for a visible block).
 *  - omitFromIdMap must drop the key (new ref) and be a no-op (same ref) when absent — the
 *    behavior the endpoint cleanup relies on to avoid needless re-renders.
 */
import { buildBlockIndexById, omitFromIdMap } from './canvasHelpers'

describe('buildBlockIndexById — equivalence with findIndex', () => {
  const shapes: Array<[string, { id: string }[]]> = [
    ['empty', []],
    ['single', [{ id: 'a' }]],
    ['ordered', [{ id: 'a' }, { id: 'b' }, { id: 'c' }]],
    ['reordered', [{ id: 'c' }, { id: 'a' }, { id: 'b' }]],
    ['many', Array.from({ length: 200 }, (_, i) => ({ id: `b${i}` }))],
  ]

  it.each(shapes)('matches findIndex for every id (%s)', (_name, blocks) => {
    const map = buildBlockIndexById(blocks)
    blocks.forEach((block) => {
      expect(map.get(block.id)).toBe(blocks.findIndex((b) => b.id === block.id))
    })
  })

  it('returns undefined for an absent id (so the `?? 0` fallback only triggers off-list)', () => {
    const map = buildBlockIndexById([{ id: 'a' }, { id: 'b' }])
    expect(map.get('missing')).toBeUndefined()
  })

  it('every block from the source array resolves to a defined index (no `?? 0` in normal flow)', () => {
    const blocks = [{ id: 'x' }, { id: 'y' }, { id: 'z' }]
    const map = buildBlockIndexById(blocks)
    // mirrors GraphContent: visibleItems are always a subset of blocks
    blocks.forEach((b) => expect(map.get(b.id)).not.toBeUndefined())
  })
})

describe('omitFromIdMap — endpoint removal semantics', () => {
  it('removes the key and returns a NEW reference', () => {
    const map = { a: 1, b: 2 }
    const next = omitFromIdMap(map, 'a')
    expect(next).not.toBe(map)
    expect('a' in next).toBe(false)
    expect(next).toEqual({ b: 2 })
  })

  it('returns the SAME reference when the key is absent (no needless re-render)', () => {
    const map = { a: 1 }
    const next = omitFromIdMap(map, 'missing')
    expect(next).toBe(map)
  })

  it('does not mutate the input map', () => {
    const map = { a: 1, b: 2 }
    omitFromIdMap(map, 'a')
    expect(map).toEqual({ a: 1, b: 2 })
  })
})
