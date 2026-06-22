import {
  Coordinates,
  useBlockCoordinates,
  useGraph,
  useGraphPosition,
} from 'contexts/GraphContext'
import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
} from 'services/graph'
import { Edge as EdgeProps } from 'models'
import { Portal, useDisclosure } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { EdgeMenu } from './EdgeMenu'
import { colors } from 'libs/theme'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = memo(({ edge }: { edge: EdgeProps }) => {
  const { deleteEdge } = useTypebot()
  const {
    previewingEdge,
    sourceEndpoints,
    targetEndpoints,
    isReadOnly,
    setPreviewingEdge,
  } = useGraph()
  const { graphPosition } = useGraphPosition()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceBlockCoordinates = useBlockCoordinates(edge.from.blockId)
  const targetBlockCoordinates = useBlockCoordinates(edge.to.blockId)

  // Offset do endpoint DENTRO do bloco (em coordenadas de mundo). É invariante à
  // posição do bloco, então o medimos via DOM apenas quando o board/endpoints
  // mudam (bloco em repouso, DOM bate com a coordenada). Durante o arraste de um
  // bloco o Y do edge passa a ser `coordenada-live-do-bloco + offset` — segue o
  // card sem `getBoundingClientRect` por frame.
  const sourceOffsetRef = useRef<number>(20)
  const targetOffsetRef = useRef<number>(20)

  useMemo(() => {
    if (!sourceEndpoints || !graphPosition) return
    const domTop = getEndpointTopOffset({
      endpoints: sourceEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: getSourceEndpointId(edge),
      graphScale: graphPosition.scale,
    })
    if (domTop !== undefined && sourceBlockCoordinates)
      sourceOffsetRef.current = domTop - sourceBlockCoordinates.y
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceEndpoints, graphPosition?.y, graphPosition?.scale, edge])

  useMemo(() => {
    if (!targetEndpoints || !graphPosition || !edge?.to.stepId) return
    const domTop = getEndpointTopOffset({
      endpoints: targetEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: edge.to.stepId,
      graphScale: graphPosition.scale,
    })
    if (domTop !== undefined && targetBlockCoordinates)
      targetOffsetRef.current = domTop - targetBlockCoordinates.y
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetEndpoints, graphPosition?.y, graphPosition?.scale, edge?.to.stepId])

  const sourceTop = sourceBlockCoordinates
    ? sourceBlockCoordinates.y + sourceOffsetRef.current
    : undefined

  // Sem stepId é um alvo-bloco → ancora no topo do bloco (targetTop indefinido).
  const targetTop =
    edge?.to.stepId && targetBlockCoordinates
      ? targetBlockCoordinates.y + targetOffsetRef.current
      : undefined

  const path = useMemo(() => {
    if (!sourceBlockCoordinates || !targetBlockCoordinates) return ``
    // Em LOD (zoom-out) o bloco vira caixa e não registra endpoints, então
    // `sourceTop` fica indefinido. Caímos para uma âncora no topo do bloco de
    // origem para o edge continuar visível (bloco-a-bloco). Em zoom normal o
    // endpoint real é usado e a ancoragem é precisa.
    const effectiveSourceTop = sourceTop ?? sourceBlockCoordinates.y + 20
    const anchorsPosition = getAnchorsPosition({
      sourceBlockCoordinates,
      targetBlockCoordinates,
      sourceTop: effectiveSourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
  }, [
    sourceBlockCoordinates?.x,
    sourceBlockCoordinates?.y,
    targetBlockCoordinates?.x,
    targetBlockCoordinates?.y,
    sourceTop,
    targetTop,
    graphPosition.scale,
  ])

  const handleMouseEnter = () => setIsMouseOver(true)

  const handleMouseLeave = () => setIsMouseOver(false)

  const handleEdgeClick = () => {
    setPreviewingEdge(edge)
  }

  const handleContextMenuTrigger = (e: React.MouseEvent) => {
    if (isReadOnly) return
    e.preventDefault()
    setEdgeMenuPosition({ x: e.clientX, y: e.clientY })
    onOpen()
  }

  const handleDeleteEdge = () => deleteEdge(edge.id)

  useEffect(() => {
    if (!isOpen) return

    const handleGlobalContextMenu = () => {
      onClose()
    }

    document.addEventListener('contextmenu', handleGlobalContextMenu, true)

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true)
    }
  }, [isOpen, onClose])

  return (
    <>
      <path
        data-testid="clickable-edge"
        d={path}
        strokeWidth="12px"
        stroke="white"
        fill="none"
        pointerEvents="stroke"
        style={{ cursor: 'pointer', visibility: 'hidden' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        onContextMenu={handleContextMenuTrigger}
      />
      <path
        data-testid="edge"
        d={path}
        stroke={isPreviewing ? colors.blue[400] : colors.gray[400]}
        strokeWidth="2px"
        markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
        fill="none"
      />
      {isOpen && (
        <Portal>
          <EdgeMenu
            isOpen={isOpen}
            position={edgeMenuPosition}
            onDeleteEdge={handleDeleteEdge}
            onClose={onClose}
          />
        </Portal>
      )}
    </>
  )
})
