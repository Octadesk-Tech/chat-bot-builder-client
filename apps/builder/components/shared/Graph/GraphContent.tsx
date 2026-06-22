import { useTypebot } from 'contexts/TypebotContext'
import React, { memo, useDeferredValue, useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { BlockNode } from './Nodes/BlockNode'
import {
  useAllBlocksCoordinates,
  useGraph,
  useGraphPosition,
} from 'contexts/GraphContext'
import { isItemVisible } from 'services/graph'
import { Block } from 'models'

// Abaixo deste zoom os blocos são renderizados em modo simplificado (LOD):
// o conteúdo dos steps fica ilegível mesmo, então trocamos a subárvore pesada
// (StepNodesList + previews + endpoints) por um resumo barato. É o que destrava
// a navegação de bots gigantes em zoom-out (onde há centenas de blocos visíveis).
export const LOD_SCALE_THRESHOLD = 0.5

// LOD só vale a pena com muitos blocos. Abaixo deste total, manter sempre o
// detalhe completo (não simplificar) — fluxos pequenos não têm o problema de
// renderizar centenas de subárvores, e perder detalhe ali seria só prejuízo.
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
    const blocksCoordinates = useAllBlocksCoordinates()

    const isSimplified =
      (typebot?.blocks?.length ?? 0) > LOD_MIN_BLOCKS &&
      graphPosition.scale < LOD_SCALE_THRESHOLD

    const visibleItems = useMemo(() => {
      if (!typebot?.blocks || !graphContainerRef.current) return []

      const containerWidth = graphContainerRef.current.offsetWidth
      const containerHeight = graphContainerRef.current.offsetHeight

      const baseVisible = typebot.blocks.filter((block) => {
        const liveCoordinates =
          blocksCoordinates[block.id] ?? block.graphCoordinates

        if (!liveCoordinates) return false

        return isItemVisible(
          { ...block, graphCoordinates: liveCoordinates },
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
      blocksCoordinates,
    ])

    // Renderiza a lista pesada de blocos em prioridade baixa: quando o conjunto
    // visível muda (re-virtualização ao panar/dar zoom), o React mantém a lista
    // antiga e monta a nova de forma interrompível, cedendo à interação — em vez
    // de bloquear a main thread por um frame longo. `visibleItems` e
    // `isSimplified` são deferidos juntos para o LOD e o conjunto ficarem sempre
    // consistentes no mesmo render.
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

    // Índice por id calculado uma vez — evita um findIndex O(n) por bloco visível
    // (era O(visíveis × total) a cada re-virtualização).
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
