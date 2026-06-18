import { useTypebot } from 'contexts/TypebotContext'
import React, { memo, useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { BlockNode } from './Nodes/BlockNode'
import { useGraph } from 'contexts/GraphContext'
import { isItemVisible } from 'services/graph'
import { buildBlockIndexById } from 'services/canvasHelpers'
import { Block } from 'models'

type Props = {
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
  graphContainerRef: React.MutableRefObject<HTMLDivElement | null>
}

const MyComponent = memo(
  ({ answersCounts, onUnlockProPlanClick, graphContainerRef }: Props) => {
    const { typebot, hideEdges } = useTypebot()
    const { graphPosition, draggingBlockId } = useGraph()

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
    }, [typebot?.blocks, graphPosition, graphContainerRef, draggingBlockId])

    const blockIndexById = useMemo(
      () => buildBlockIndexById(typebot?.blocks ?? []),
      [typebot?.blocks]
    )

    const visibleItemsMap = useMemo(() => {
      const map = new Map<string, Block>()
      visibleItems.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    }, [visibleItems])

    const visibleEdges = useMemo(() => {
      if (!typebot?.edges) return []

      return typebot.edges.filter((edge) => {
        const fromVisible = visibleItemsMap.has(edge.from.blockId)
        const toVisible = visibleItemsMap.has(edge.to.blockId)

        return fromVisible || toVisible
      })
    }, [typebot?.edges, visibleItemsMap])

    return (
      <>
        {!hideEdges && (
          <Edges
            visibleItems={visibleItems}
            edges={visibleEdges}
            blocks={typebot?.blocks ?? []}
            answersCounts={answersCounts}
            onUnlockProPlanClick={onUnlockProPlanClick}
          />
        )}

        {visibleItems.map((block) => {
          const blockIndex = blockIndexById.get(block.id)
          return (
            <BlockNode
              block={block}
              blockIndex={blockIndex ?? 0}
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
