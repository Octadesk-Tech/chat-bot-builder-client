import { useRef } from 'react'
import { Coordinates, useGraphPosition } from 'contexts/GraphContext'
import { useTypebotExtras } from 'contexts/TypebotContext'

// Tamanho médio de um card de bloco. Usado para descontar metade do card ao
// centralizar, de forma que o bloco fique no meio da viewport (não a borda).
const averageSizeCard = 315

// Tempo até remontar as conexões depois de mover o board. Casa com o
// `showEdgesTimeOut` do Graph.tsx (o board anima o transform em ~0.1s; 500ms
// garante que ele já assentou na posição final antes de recalcular as linhas).
const showEdgesTimeOut = 500

/**
 * Centraliza o board (pan/zoom) sobre coordenadas de um bloco. Mesma conta
 * usada em `goToBegining` (GraphContext) e no antigo `focusOnField`
 * (emptyFieldsItem) — extraída para ser reutilizada.
 */
export const useGraphFocus = () => {
  const { setGraphPosition } = useGraphPosition()
  const { setHideEdges } = useTypebotExtras()

  const hideEdgesTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const focusOnCoordinates = (graphCoordinates?: Coordinates) => {
    if (!graphCoordinates) return

    // As conexões usam getBoundingClientRect e ficariam tortas se recalculadas
    // enquanto o board ainda anima. Removemos as linhas antes de mover e as
    // remontamos depois que o board assenta — recomputando a geometria certa.
    setHideEdges(true)

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
    const calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

    setGraphPosition({ x: calcX, y: calcY, scale: 1 })

    // Se houver outro focus em sequência, cancela o timer anterior para não
    // remontar as linhas no meio do próximo movimento.
    if (hideEdgesTimeoutRef.current) clearTimeout(hideEdgesTimeoutRef.current)
    hideEdgesTimeoutRef.current = setTimeout(
      () => setHideEdges(false),
      showEdgesTimeOut
    )
  }

  return { focusOnCoordinates }
}
