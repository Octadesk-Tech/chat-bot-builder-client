/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * CHAT-1630 / 306318 — safety characterization for Fase 1A (dedup of updateBlocksHasConnections).
 *
 * The fix removes the redundant per-action calls and relies on the single choke point
 * (useUndo.ts:140, runs on every setLocalTypebot). That is only safe if the function is
 * IDEMPOTENT: running it on already-computed blocks yields the same `hasConnection` flags
 * as running it once. These tests pin that invariant against the REAL function.
 */
import { LogicStepType, InputStepType } from 'models'
import { updateBlocksHasConnections } from './block-connections'

const clone = (x: any) => JSON.parse(JSON.stringify(x))
const flags = (blocks: any[]) => blocks.map((b) => ({ id: b.id, hasConnection: b.hasConnection }))

const step = (id: string, type: string, extra: any = {}) => ({
  id,
  type,
  outgoingEdgeId: undefined,
  ...extra,
})

// linear: b0 -> b1 -> b2
const linearFlow = () => ({
  blocks: [
    { id: 'b0', graphCoordinates: { x: 0, y: 0 }, steps: [step('s0', 'text bubble')] },
    { id: 'b1', graphCoordinates: { x: 1, y: 0 }, steps: [step('s1', 'text bubble', { outgoingEdgeId: 'e1' })] },
    { id: 'b2', graphCoordinates: { x: 2, y: 0 }, steps: [step('s2', 'text bubble')] },
  ],
  edges: [
    { id: 'e0', from: { blockId: 'b0', stepId: 's0' }, to: { blockId: 'b1' } },
    { id: 'e1', from: { blockId: 'b1', stepId: 's1' }, to: { blockId: 'b2' } },
  ],
})

// a CONDITION step with items (branching), one item connected, one not
const branchingFlow = () => ({
  blocks: [
    { id: 'b0', graphCoordinates: { x: 0, y: 0 }, steps: [step('s0', 'text bubble', { outgoingEdgeId: 'e0' })] },
    {
      id: 'b1',
      graphCoordinates: { x: 1, y: 0 },
      steps: [
        step('s1', LogicStepType.CONDITION, {
          items: [
            { id: 'i1', outgoingEdgeId: 'e1' },
            { id: 'i2', outgoingEdgeId: undefined },
          ],
        }),
      ],
    },
    { id: 'b2', graphCoordinates: { x: 2, y: 0 }, steps: [step('s2', 'text bubble')] },
  ],
  edges: [
    { id: 'e0', from: { blockId: 'b0', stepId: 's0' }, to: { blockId: 'b1' } },
    { id: 'e1', from: { blockId: 'b1', itemId: 'i1' }, to: { blockId: 'b2' } },
  ],
})

const choiceFlow = () => ({
  blocks: [
    { id: 'b0', graphCoordinates: { x: 0, y: 0 }, steps: [step('s0', 'text bubble', { outgoingEdgeId: 'e0' })] },
    {
      id: 'b1',
      graphCoordinates: { x: 1, y: 0 },
      steps: [step('s1', InputStepType.CHOICE, { items: [{ id: 'i1', outgoingEdgeId: undefined }] })],
    },
  ],
  edges: [{ id: 'e0', from: { blockId: 'b0', stepId: 's0' }, to: { blockId: 'b1' } }],
})

const cases: Array<[string, () => any]> = [
  ['linear', linearFlow],
  ['branching/condition', branchingFlow],
  ['choice w/ unconnected item', choiceFlow],
]

describe('updateBlocksHasConnections — idempotency (Fase 1A safety)', () => {
  it.each(cases)('is idempotent for %s flow (running twice == once)', (_name, make) => {
    const tb = make()
    const once = updateBlocksHasConnections(clone(tb))
    // simulate the double-run that exists today: per-action call, then choke point
    const twice = updateBlocksHasConnections({ blocks: clone(once), edges: clone(tb.edges) } as any)
    expect(flags(twice)).toEqual(flags(once))
  })

  it('does not read prior hasConnection (pre-seeded value does not change result)', () => {
    const tb = linearFlow()
    const fresh = updateBlocksHasConnections(clone(tb))
    const preSeeded = clone(tb)
    preSeeded.blocks.forEach((b: any) => (b.hasConnection = true)) // pretend already computed wrong
    const recomputed = updateBlocksHasConnections(preSeeded)
    expect(flags(recomputed)).toEqual(flags(fresh))
  })
})

describe('updateBlocksHasConnections — structural sanity', () => {
  it('single block is always hasConnection=true (length<=1 branch)', () => {
    const out = updateBlocksHasConnections({
      blocks: [{ id: 'only', graphCoordinates: { x: 0, y: 0 }, steps: [step('s', 'text bubble')] }],
      edges: [],
    } as any)
    expect(out[0].hasConnection).toBe(true)
  })

  it('flags are deterministic across runs (same input -> same flags)', () => {
    const tb = branchingFlow()
    const a = flags(updateBlocksHasConnections(clone(tb)))
    const b = flags(updateBlocksHasConnections(clone(tb)))
    expect(a).toEqual(b)
  })
})
