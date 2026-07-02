import { BoxProps, Flex } from '@chakra-ui/react'
import { useCoordinatesReady, useGraph } from 'contexts/GraphContext'
import { useTypebotExtras } from 'contexts/TypebotContext'
import { Source } from 'models'
import React, { MouseEvent, useEffect, useRef, useState } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: Source
}) => {
  const [ranOnce, setRanOnce] = useState(false)
  const { setConnectingIds, addSourceEndpoint, removeSourceEndpoint, previewingEdge } = useGraph()
  const coordinatesReady = useCoordinatesReady()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setConnectingIds({ source })
  }

  useEffect(() => {
    if (ranOnce || !ref.current || !coordinatesReady) return
    const id = source.itemId ?? source.stepId
    addSourceEndpoint({ id, ref })
    setRanOnce(true)
    return () => removeSourceEndpoint(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, coordinatesReady])

  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      rounded="full"
      onMouseDownCapture={handleMouseDown}
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      {...props}
    >
      <Flex
        boxSize="20px"
        justify="center"
        align="center"
        bgColor="gray.100"
        rounded="full"
      >
        <Flex
          boxSize="13px"
          rounded="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge?.from.stepId === source.stepId &&
            previewingEdge.from.itemId === source.itemId
              ? 'blue.300'
              : 'blue.200'
          }
        />
      </Flex>
    </Flex>
  )
}
