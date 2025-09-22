import { Coordinates, useGraph } from 'contexts/GraphContext'
import React, { useMemo, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
  computedItemHeight,
} from 'services/graph'
import { Block, Edge as EdgeProps } from 'models'
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

export const Edge = ({
  edge,
  block,
  visibleItems,
}: {
  edge: EdgeProps
  block: Block
  visibleItems: Block[]
}) => {
  const { typebot } = useTypebot()
  const { deleteEdge } = useTypebot()
  const {
    previewingEdge,
    sourceEndpoints,
    targetEndpoints,
    blocksCoordinates,
    graphPosition,
    isReadOnly,
    setPreviewingEdge,
  } = useGraph()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.from.blockId]
  const targetBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.to.blockId]

  const sourceTop = useMemo(() => {
    if (!graphPosition.y || !graphPosition.scale) return 0
    
    if (sourceEndpoints) {
      const endpointTop = getEndpointTopOffset({
        endpoints: sourceEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: getSourceEndpointId(edge),
        graphScale: graphPosition.scale,
      })
      if (endpointTop !== undefined) return endpointTop
    }
    
    if (sourceBlockCoordinates.y) {
      const sourceBlock = typebot?.blocks?.find(b => b.id === edge.from.blockId)
      if (sourceBlock) {
        const blockHeight = computedItemHeight(sourceBlock)
        return sourceBlockCoordinates.y + (blockHeight / 2)
      }
      return sourceBlockCoordinates.y + 250
    }
    
    return 0
  }, [sourceEndpoints, graphPosition?.y, graphPosition?.scale, edge, sourceBlockCoordinates.y, typebot?.blocks])

  const targetTop = useMemo(() => {
    if (!graphPosition.y || !graphPosition.scale) return 0
    
    if (targetEndpoints) {
      const endpointTop = getEndpointTopOffset({
        endpoints: targetEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: edge?.to.stepId,
        graphScale: graphPosition.scale,
      })
      if (endpointTop !== undefined) return endpointTop
    }
    
    if (targetBlockCoordinates.y) {
      const targetBlock = typebot?.blocks?.find(b => b.id === edge.to.blockId)
      if (targetBlock) {
        const blockHeight = computedItemHeight(targetBlock)
        return targetBlockCoordinates.y + (blockHeight / 2)
      }
      return targetBlockCoordinates.y + 250
    }
    
    return 0
  }, [targetEndpoints, graphPosition?.y, graphPosition?.scale, edge?.to.stepId, edge?.to.blockId, targetBlockCoordinates.y, typebot?.blocks])

  const path = useMemo(() => {
    if (!sourceBlockCoordinates || !targetBlockCoordinates)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlockCoordinates,
      targetBlockCoordinates,
      sourceTop,
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
      <Portal>
        <EdgeMenu
          isOpen={isOpen}
          position={edgeMenuPosition}
          onDeleteEdge={handleDeleteEdge}
          onClose={onClose}
        />
      </Portal>
    </>
  )
}
