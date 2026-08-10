import { useRef } from 'react'
import { Coordinates, useGraphPosition } from 'contexts/GraphContext'
import { useTypebotExtras } from 'contexts/TypebotContext'

const averageSizeCard = 315

const showEdgesTimeOut = 500

export const useGraphFocus = () => {
  const { setGraphPosition } = useGraphPosition()
  const { setHideEdges } = useTypebotExtras()

  const hideEdgesTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const focusOnCoordinates = (graphCoordinates?: Coordinates) => {
    if (!graphCoordinates) return

    setHideEdges(true)

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
    const calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

    setGraphPosition({ x: calcX, y: calcY, scale: 1 })

    if (hideEdgesTimeoutRef.current) clearTimeout(hideEdgesTimeoutRef.current)
    hideEdgesTimeoutRef.current = setTimeout(
      () => setHideEdges(false),
      showEdgesTimeOut
    )
  }

  return { focusOnCoordinates }
}
