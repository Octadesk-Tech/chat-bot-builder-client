import { useCallback, useRef } from 'react'
import { useGraph } from 'contexts/GraphContext'
import { Step } from 'models'
import { stepHasItems } from 'utils'

export const useRefreshGraphConnections = () => {
  const { setGraphPosition } = useGraph()
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const refreshConnections = useCallback((step: Step) => {
    if (!stepHasItems(step)) {
      return
    }

    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current = []

    const firstTimeout = setTimeout(() => {
      setGraphPosition((prev) => ({
        ...prev,
        y: prev.y + 0.01,
      }))

      const secondTimeout = setTimeout(() => {
        setGraphPosition((prev) => ({
          ...prev,
          y: prev.y - 0.01,
        }))
      }, 0)

      timeoutRefs.current.push(secondTimeout)
    }, 0)

    timeoutRefs.current.push(firstTimeout)
  }, [setGraphPosition])

  const cleanup = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  return { refreshConnections, cleanup }
}

