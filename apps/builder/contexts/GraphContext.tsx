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
  useState,
} from 'react'
import { useTypebot } from './TypebotContext'
import { omitFromIdMap } from 'services/canvasHelpers'

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

const graphContext = createContext<{
  blocksCoordinates: BlocksCoordinates
  updateBlockCoordinates: (blockId: string, newCoord: Coordinates) => void
  graphPosition: Position
  goToBegining: () => void
  setGraphPosition: Dispatch<SetStateAction<Position>>
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
}>({
  graphPosition: graphPositionDefaultValue,
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
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingEdge, setPreviewingEdge] = useState<Edge>()
  const [sourceEndpoints, setSourceEndpoints] = useState<IdMap<Endpoint>>({})
  const [targetEndpoints, setTargetEndpoints] = useState<IdMap<Endpoint>>({})
  const [openedStepId, setOpenedStepId] = useState<string>()
  const [blocksCoordinates, setBlocksCoordinates] = useState<BlocksCoordinates>(
    {}
  )
  const [focusedBlockId, setFocusedBlockId] = useState<string>()
  const [draggingBlockId, setDraggingBlockId] = useState<string>()
  const { typebot } = useTypebot()

  useEffect(() => {
    setBlocksCoordinates(
      blocks.reduce(
        (coords, block) => ({
          ...coords,
          [block.id]: block.graphCoordinates,
        }),
        {}
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  const addSourceEndpoint = (endpoint: Endpoint) => {
    setSourceEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
  }

  const addTargetEndpoint = (endpoint: Endpoint) => {
    setTargetEndpoints((endpoints) => ({
      ...endpoints,
      [endpoint.id]: endpoint,
    }))
  }

  // CHAT-1630: endpoints must be removed when their node unmounts (culling), otherwise
  // the map keeps stale refs to detached DOM and edges compute wrong/empty paths.
  const removeSourceEndpoint = useCallback((id: string) => {
    setSourceEndpoints((endpoints) => omitFromIdMap(endpoints, id))
  }, [])

  const removeTargetEndpoint = useCallback((id: string) => {
    setTargetEndpoints((endpoints) => omitFromIdMap(endpoints, id))
  }, [])

  const updateBlockCoordinates = (blockId: string, newCoord: Coordinates) =>
    setBlocksCoordinates((blocksCoordinates) => ({
      ...blocksCoordinates,
      [blockId]: newCoord,
    }))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const goToBegining = () => {
    const stepStart = typebot?.blocks.find((block) =>
      block.steps.find((step) => step.type === 'start')
    )
    if (stepStart === undefined) return
    const graphCoordinates = stepStart.graphCoordinates
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const averageSizeCard = 315

    let calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
    let calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

    if (graphPosition.x === calcX && graphPosition.y === calcY) {
      calcX = calcX + 1
      calcY = calcY + 1
    }

    const timer = setTimeout(() => {
      setGraphPosition({ x: calcX, y: calcY, scale: 1 })
      clearTimeout(timer)
    }, 300)
  }

  const contextValue = useMemo(
    () => ({
      graphPosition,
      setGraphPosition,
      goToBegining,
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
      blocksCoordinates,
      updateBlockCoordinates,
      isReadOnly,
      focusedBlockId,
      setFocusedBlockId,
      draggingBlockId,
      setDraggingBlockId,
    }),
    [
      graphPosition,
      setGraphPosition,
      goToBegining,
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
      blocksCoordinates,
      updateBlockCoordinates,
      isReadOnly,
      focusedBlockId,
      setFocusedBlockId,
      draggingBlockId,
      setDraggingBlockId,
    ]
  )

  return (
    <graphContext.Provider value={contextValue}>
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
