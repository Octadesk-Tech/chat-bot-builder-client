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

/**
 * Store externo das coordenadas dos blocos.
 *
 * Mantém as coordenadas fora do `value` do React context para que arrastar um
 * bloco não recrie o context e re-renderize TODOS os consumidores. Cada
 * componente assina via `useSyncExternalStore` e só re-renderiza quando a fatia
 * que ele lê muda de identidade (a coordenada do seu próprio bloco, ou o objeto
 * inteiro para quem precisa de todas).
 */
export class CoordinatesStore {
  private coordinates: BlocksCoordinates = {}
  private listeners = new Set<CoordinatesListener>()
  private ready = false

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
    this.coordinates = coordinates
    this.ready = true
    this.emit()
  }

  update = (blockId: string, newCoord: Coordinates) => {
    const current = this.coordinates[blockId]
    if (current && current.x === newCoord.x && current.y === newCoord.y) return
    this.coordinates = { ...this.coordinates, [blockId]: newCoord }
    this.emit()
  }
}

/**
 * Context isolado para a posição do grafo (pan/zoom). Separado do `graphContext`
 * para que mudanças de pan/zoom NÃO recriem o value do context principal e
 * re-renderizem todos os consumidores. Quem só precisa do `scale` em handlers
 * de drag deve usar `getGraphPosition()` (leitura imperativa, sem assinatura).
 */
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
  targetEndpoints: IdMap<Endpoint>
  addTargetEndpoint: (endpoint: Endpoint) => void
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
  // Espelho síncrono da posição para leitura imperativa (sem assinatura).
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

  const addSourceEndpoint = useCallback((endpoint: Endpoint) => {
    setSourceEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
  }, [])

  const addTargetEndpoint = useCallback((endpoint: Endpoint) => {
    setTargetEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
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

    const timer = setTimeout(() => {
      setGraphPosition((prev) => {
        let calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
        let calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

        if (prev.x === calcX && prev.y === calcY) {
          calcX = calcX + 1
          calcY = calcY + 1
        }

        return { x: calcX, y: calcY, scale: 1 }
      })
      clearTimeout(timer)
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
      addTargetEndpoint,
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
      addTargetEndpoint,
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

/**
 * Assina a coordenada de UM bloco. O componente só re-renderiza quando a
 * coordenada desse bloco muda — arrastar outro bloco não o afeta.
 */
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

/**
 * Assina o mapa completo de coordenadas. Use apenas onde realmente é preciso
 * conhecer todas (ex.: cálculo de visibilidade). Re-renderiza a cada mudança.
 */
export const useAllBlocksCoordinates = (): BlocksCoordinates => {
  const { coordinatesStore } = useContext(graphContext)
  return useSyncExternalStore(
    coordinatesStore.subscribe,
    coordinatesStore.getSnapshot,
    coordinatesStore.getSnapshot
  )
}

/**
 * Booleano que vira `true` quando as coordenadas iniciais foram carregadas.
 * Estável: só dispara re-render na transição false → true.
 */
export const useCoordinatesReady = (): boolean => {
  const { coordinatesStore } = useContext(graphContext)
  return useSyncExternalStore(
    coordinatesStore.subscribe,
    coordinatesStore.isReady,
    coordinatesStore.isReady
  )
}
