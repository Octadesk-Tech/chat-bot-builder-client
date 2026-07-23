import { Block, Edge, IdMap, Source, Step, Target } from 'models'
import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useTypebot } from './TypebotContext'

export const stubLength = 20
export const blockWidth = 300
export const blockAnchorsOffset = {
  left: {
    x: 0,
    y: 20,
  },
  top: {
    x: blockWidth / 2,
    y: 0,
  },
  right: {
    x: blockWidth,
    y: 20,
  },
}

export type Coordinates = { x: number; y: number }

type Position = Coordinates & { scale: number }

export type Anchor = {
  coordinates: Coordinates
}

export type Node = Omit<Block, 'steps'> & {
  steps: (Step & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates }
  })[]
}

export const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

export type ConnectingIds = {
  source: Source
  target?: Target
}

type StepId = string
type ButtonId = string
export type Endpoint = {
  id: StepId | ButtonId
  ref: MutableRefObject<HTMLDivElement | null>
}

export type BlocksCoordinates = IdMap<Coordinates>

type CoordinatesListener = () => void

export class CoordinatesStore {
  private coordinates: BlocksCoordinates = {}
  private listeners = new Set<CoordinatesListener>()
  private ready = false
  private pendingFrame: number | null = null

  getSnapshot = (): BlocksCoordinates => this.coordinates

  getBlock = (blockId?: string): Coordinates | undefined =>
    blockId ? this.coordinates[blockId] : undefined

  isReady = (): boolean => this.ready

  subscribe = (listener: CoordinatesListener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit() {
    this.listeners.forEach((listener) => listener())
  }

  setAll = (coordinates: BlocksCoordinates) => {
    if (this.pendingFrame !== null) {
      cancelAnimationFrame(this.pendingFrame)
      this.pendingFrame = null
    }
    this.coordinates = coordinates
    this.ready = true
    this.emit()
  }

  update = (blockId: string, newCoord: Coordinates) => {
    const current = this.coordinates[blockId]
    if (current && current.x === newCoord.x && current.y === newCoord.y) return
    this.coordinates = { ...this.coordinates, [blockId]: newCoord }

    if (this.pendingFrame === null) {
      this.pendingFrame = requestAnimationFrame(() => {
        this.pendingFrame = null
        this.emit()
      })
    }
  }

  dispose = () => {
    if (this.pendingFrame !== null) {
      cancelAnimationFrame(this.pendingFrame)
      this.pendingFrame = null
    }
  }
}

const graphPositionContext = createContext<{
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
}>({
  graphPosition: graphPositionDefaultValue,
  setGraphPosition: () => undefined,
})

const graphContext = createContext<{
  updateBlockCoordinates: (blockId: string, newCoord: Coordinates) => void
  goToBegining: () => void
  getGraphPosition: () => Position
  connectingIds: ConnectingIds | null
  setConnectingIds: Dispatch<SetStateAction<ConnectingIds | null>>
  previewingEdge?: Edge
  setPreviewingEdge: Dispatch<SetStateAction<Edge | undefined>>
  sourceEndpoints: IdMap<Endpoint>
  addSourceEndpoint: (endpoint: Endpoint) => void
  removeSourceEndpoint: (id: string) => void
  targetEndpoints: IdMap<Endpoint>
  addTargetEndpoint: (endpoint: Endpoint) => void
  removeTargetEndpoint: (id: string) => void
  openedStepId?: string
  setOpenedStepId: Dispatch<SetStateAction<string | undefined>>
  isReadOnly: boolean
  focusedBlockId?: string
  setFocusedBlockId: Dispatch<SetStateAction<string | undefined>>
  draggingBlockId?: string
  setDraggingBlockId: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  coordinatesStore: CoordinatesStore
  getBlockCoordinates: (blockId?: string) => Coordinates | undefined
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
}>({
  connectingIds: null,
})

export const GraphProvider = ({
  children,
  blocks,
  isReadOnly = false,
}: {
  children: ReactNode
  blocks: Block[]
  isReadOnly?: boolean
}) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const graphPositionRef = useRef(graphPosition)
  graphPositionRef.current = graphPosition
  const getGraphPosition = useCallback(() => graphPositionRef.current, [])
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingEdge, setPreviewingEdge] = useState<Edge>()
  const [sourceEndpoints, setSourceEndpoints] = useState<IdMap<Endpoint>>({})
  const [targetEndpoints, setTargetEndpoints] = useState<IdMap<Endpoint>>({})
  const [openedStepId, setOpenedStepId] = useState<string>()
  const coordinatesStoreRef = useRef<CoordinatesStore>()
  if (!coordinatesStoreRef.current)
    coordinatesStoreRef.current = new CoordinatesStore()
  const coordinatesStore = coordinatesStoreRef.current
  const goToBeginingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [focusedBlockId, setFocusedBlockId] = useState<string>()
  const [draggingBlockId, setDraggingBlockId] = useState<string>()
  const { typebot } = useTypebot()

  useEffect(() => {
    coordinatesStore.setAll(
      Object.fromEntries(
        blocks.map((block) => [block.id, block.graphCoordinates])
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  useEffect(() => {
    return () => {
      if (goToBeginingTimerRef.current) clearTimeout(goToBeginingTimerRef.current)
      coordinatesStoreRef.current?.dispose()
    }
  }, [])

  const addSourceEndpoint = useCallback((endpoint: Endpoint) => {
    setSourceEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
  }, [])

  const removeSourceEndpoint = useCallback((id: string) => {
    setSourceEndpoints((endpoints) => {
      const next = { ...endpoints }
      delete next[id]
      return next
    })
  }, [])

  const addTargetEndpoint = useCallback((endpoint: Endpoint) => {
    setTargetEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
  }, [])

  const removeTargetEndpoint = useCallback((id: string) => {
    setTargetEndpoints((endpoints) => {
      const next = { ...endpoints }
      delete next[id]
      return next
    })
  }, [])

  const updateBlockCoordinates = useCallback(
    (blockId: string, newCoord: Coordinates) =>
      coordinatesStore.update(blockId, newCoord),
    [coordinatesStore]
  )

  const getBlockCoordinates = useCallback(
    (blockId?: string) => coordinatesStore.getBlock(blockId),
    [coordinatesStore]
  )

  const goToBegining = useCallback(() => {
    const stepStart = typebot?.blocks.find((block) =>
      block.steps.find((step) => step.type === 'start')
    )
    if (stepStart === undefined) return
    const graphCoordinates = stepStart.graphCoordinates
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const averageSizeCard = 315

    if (goToBeginingTimerRef.current) clearTimeout(goToBeginingTimerRef.current)
    goToBeginingTimerRef.current = setTimeout(() => {
      goToBeginingTimerRef.current = null
      setGraphPosition((prev) => {
        let calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
        let calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

        if (prev.x === calcX && prev.y === calcY) {
          calcX = calcX + 1
          calcY = calcY + 1
        }

        return { x: calcX, y: calcY, scale: 1 }
      })
    }, 300)
  }, [typebot])

  const contextValue = useMemo(
    () => ({
      goToBegining,
      getGraphPosition,
      connectingIds,
      setConnectingIds,
      previewingEdge,
      setPreviewingEdge,
      sourceEndpoints,
      targetEndpoints,
      addSourceEndpoint,
      removeSourceEndpoint,
      addTargetEndpoint,
      removeTargetEndpoint,
      openedStepId,
      setOpenedStepId,
      coordinatesStore,
      updateBlockCoordinates,
      getBlockCoordinates,
      isReadOnly,
      focusedBlockId,
      setFocusedBlockId,
      draggingBlockId,
      setDraggingBlockId,
    }),
    [
      goToBegining,
      getGraphPosition,
      connectingIds,
      setConnectingIds,
      previewingEdge,
      setPreviewingEdge,
      sourceEndpoints,
      targetEndpoints,
      addSourceEndpoint,
      removeSourceEndpoint,
      addTargetEndpoint,
      removeTargetEndpoint,
      openedStepId,
      setOpenedStepId,
      coordinatesStore,
      updateBlockCoordinates,
      getBlockCoordinates,
      isReadOnly,
      focusedBlockId,
      setFocusedBlockId,
      draggingBlockId,
      setDraggingBlockId,
    ]
  )

  const graphPositionValue = useMemo(
    () => ({ graphPosition, setGraphPosition }),
    [graphPosition]
  )

  return (
    <graphPositionContext.Provider value={graphPositionValue}>
      <graphContext.Provider value={contextValue}>
        {children}
      </graphContext.Provider>
    </graphPositionContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)

export const useGraphPosition = () => useContext(graphPositionContext)

export const useBlockCoordinates = (blockId?: string) => {
  const { coordinatesStore } = useContext(graphContext)
  const getSnapshot = useCallback(
    () => coordinatesStore.getBlock(blockId),
    [coordinatesStore, blockId]
  )
  return useSyncExternalStore(
    coordinatesStore.subscribe,
    getSnapshot,
    getSnapshot
  )
}

export const useAllBlocksCoordinates = (): BlocksCoordinates => {
  const { coordinatesStore } = useContext(graphContext)
  return useSyncExternalStore(
    coordinatesStore.subscribe,
    coordinatesStore.getSnapshot,
    coordinatesStore.getSnapshot
  )
}

export const useCoordinatesReady = (): boolean => {
  const { coordinatesStore } = useContext(graphContext)
  return useSyncExternalStore(
    coordinatesStore.subscribe,
    coordinatesStore.isReady,
    coordinatesStore.isReady
  )
}
