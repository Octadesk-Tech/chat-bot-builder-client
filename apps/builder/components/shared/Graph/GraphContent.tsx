import { useTypebot } from 'contexts/TypebotContext'
import React, { memo, useDeferredValue, useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { BlockNode } from './Nodes/BlockNode'
import {
  useGraph,
  useGraphPosition,
} from 'contexts/GraphContext'
import { isItemVisible } from 'services/graph'
import { Block } from 'models'

export const LOD_SCALE_THRESHOLD = 0.5

export const LOD_MIN_BLOCKS = 50

type Props = {
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
  graphContainerRef: React.MutableRefObject<HTMLDivElement | null>
}

const MyComponent = memo(
  ({ answersCounts, onUnlockProPlanClick, graphContainerRef }: Props) => {
    const { typebot, hideEdges } = useTypebot()
    const { draggingBlockId } = useGraph()
    const { graphPosition } = useGraphPosition()

    const isSimplified =
      (typebot?.blocks?.length ?? 0) > LOD_MIN_BLOCKS &&
      graphPosition.scale < LOD_SCALE_THRESHOLD

    const visibleItems = useMemo(() => {
      if (!typebot?.blocks || !graphContainerRef.current) return []

      const containerWidth = graphContainerRef.current.offsetWidth
      const containerHeight = graphContainerRef.current.offsetHeight

      const baseVisible = typebot.blocks.filter((block) => {
        if (!block.graphCoordinates) return false

        return isItemVisible(
          block,
          graphPosition,
          containerWidth,
          containerHeight,
          typebot.blocks.length
        )
      })

      if (!draggingBlockId) return baseVisible

      const draggingBlock = typebot.blocks.find(
        (block) => block.id === draggingBlockId
      )
      if (!draggingBlock) return baseVisible

      const alreadyVisible = baseVisible.some(
        (block) => block.id === draggingBlockId
      )
      if (alreadyVisible) return baseVisible

      return [...baseVisible, draggingBlock]
    }, [
      typebot?.blocks,
      graphPosition,
      graphContainerRef,
      draggingBlockId,
    ])

    const { items: renderedItems, simplified: renderedSimplified } =
      useDeferredValue(
        useMemo(
          () => ({ items: visibleItems, simplified: isSimplified }),
          [visibleItems, isSimplified]
        )
      )

    const visibleItemsMap = useMemo(() => {
      const map = new Map<string, Block>()
      renderedItems.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    }, [renderedItems])

    const visibleEdges = useMemo(() => {
      if (!typebot?.edges) return []

      return typebot.edges.filter((edge) => {
        const fromVisible = visibleItemsMap.has(edge.from.blockId)
        const toVisible = visibleItemsMap.has(edge.to.blockId)

        return fromVisible || toVisible
      })
    }, [typebot?.edges, visibleItemsMap])

    const blockIndexById = useMemo(() => {
      const map = new Map<string, number>()
      typebot?.blocks.forEach((b, i) => map.set(b.id, i))
      return map
    }, [typebot?.blocks])

    return (
      <>
          {!hideEdges && <Edges
            edges={visibleEdges}
            answersCounts={answersCounts}
            onUnlockProPlanClick={onUnlockProPlanClick}
          />}

        {renderedItems.map((block) => {
          const blockIndex = blockIndexById.get(block.id)
          return (
            <BlockNode
              block={block}
              blockIndex={blockIndex ?? 0}
              simplified={renderedSimplified}
              key={block.id}
            />
          )
        })}
      </>
    )
  }
)

// Performance hack, never rerender when graph (parent) is panned
const areEqual = () => true

export default React.memo(MyComponent, areEqual)
