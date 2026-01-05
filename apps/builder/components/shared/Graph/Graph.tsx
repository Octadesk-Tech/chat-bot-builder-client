import {
  Flex,
  FlexProps,
  useEventListener,
  Stack,
  Tooltip,
  IconButton,
} from '@chakra-ui/react'
import { RedoIcon, UndoIcon } from 'assets/icons'
import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  memo,
  useCallback,
} from 'react'
import {
  blockWidth,
  Coordinates,
  graphPositionDefaultValue,
  useGraph,
} from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { DraggableStepType, PublicTypebot, Typebot } from 'models'
import { AnswersCount } from 'services/analytics'
import { useDebounce, useThrottledCallback } from 'use-debounce'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import GraphContent from './GraphContent'
import cuid from 'cuid'
import { headerHeight } from '../TypebotHeader'
import { ZoomButtons } from './ZoomButtons'

const maxScale = 2.0
const minScale = 0.2
const zoomButtonsScaleStep = 0.2
const hideEdgesOn = ['graph-content', 'block-node-']
const showEdgesTimeOut = 500

export const Graph = memo(
  ({
    typebot,
    answersCounts,
    onUnlockProPlanClick,
    ...props
  }: {
    typebot?: Typebot | PublicTypebot
    answersCounts?: AnswersCount[]
    onUnlockProPlanClick?: () => void
  } & FlexProps) => {
    const {
      draggedStepType,
      setDraggedStepType,
      draggedStep,
      setDraggedStep,
      draggedItem,
      setDraggedItem,
    } = useStepDnd()

    const graphContainerRef = useRef<HTMLDivElement | null>(null)

    const editorContainerRef = useRef<HTMLDivElement | null>(null)

    const {
      createBlock,
      undo,
      redo,
      canUndo,
      canRedo,
      setHideEdges,
    } = useTypebot()
    const {
      setGraphPosition: setGlobalGraphPosition,
      graphPosition: globalGraphPosition,
      setOpenedStepId,
      updateBlockCoordinates,
      blocksCoordinates,
      setPreviewingEdge,
      connectingIds,
      goToBegining,
      draggingBlockId,
    } = useGraph()

    const [graphPosition, setGraphPosition] = useState(
      graphPositionDefaultValue
    )

    const [isMovingBoard, setIsMovingBoard] = useState(false)

    const [debouncedGraphPosition] = useDebounce(graphPosition, 200)
    const isMovingBoardRef = useRef(isMovingBoard)

    useEffect(() => {
      isMovingBoardRef.current = isMovingBoard
    }, [isMovingBoard])

    useEffect(() => {
      if (isMovingBoard) {
        setHideEdges(true)
      } else {
        const timeout = setTimeout(() => {
          if (!isMovingBoardRef.current) {
            setHideEdges(false)
          }
        }, showEdgesTimeOut)

        return () => clearTimeout(timeout)
      }
    }, [isMovingBoard])

    const transform = useMemo(() => {
      return `translate(${Number(graphPosition.x.toFixed(2))}px, ${Number(
        graphPosition.y.toFixed(2)
      )}px) scale(${Number(graphPosition.scale.toFixed(2))})`
    }, [graphPosition])

    const [autoMoveDirection, setAutoMoveDirection] = useState<
      'top' | 'right' | 'bottom' | 'left' | undefined
    >()

    const lastMousePosRef = useRef<{ x: number; y: number } | null>(null)
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null)
    const prevDraggingIdRef = useRef<string | undefined>(undefined)

    useAutoMoveBoard(autoMoveDirection, setGraphPosition)

    useEffect(() => {
      window.addEventListener('message', handleEventListeners)

      return () => window.removeEventListener('message', handleEventListeners)
    }, [typebot, graphPosition])

    useEffect(() => {
      if (
        globalGraphPosition.scale === graphPosition.scale &&
        globalGraphPosition.x === graphPosition.x &&
        globalGraphPosition.y === graphPosition.y
      )
        return

      setGraphPosition({ ...globalGraphPosition })
    }, [globalGraphPosition])

    useEffect(() => {
      if (!typebot) return
      setIsMovingBoard(true)
      goToBegining()
      setTimeout(() => {
        setIsMovingBoard(false)
      }, showEdgesTimeOut)
    }, [])

    useEffect(() => {
      if (!draggingBlockId || !lastMousePosRef.current) {
        dragOffsetRef.current = null
        prevDraggingIdRef.current = undefined
        return
      }

      if (
        prevDraggingIdRef.current === draggingBlockId &&
        dragOffsetRef.current
      )
        return

      const blockCoordinates =
        blocksCoordinates[draggingBlockId] ??
        typebot?.blocks.find((block) => block.id === draggingBlockId)
          ?.graphCoordinates

      if (!blockCoordinates) return

      const mouseWorld = {
        x: (lastMousePosRef.current.x - graphPosition.x) / graphPosition.scale,
        y: (lastMousePosRef.current.y - graphPosition.y) / graphPosition.scale,
      }

      dragOffsetRef.current = {
        x: mouseWorld.x - blockCoordinates.x,
        y: mouseWorld.y - blockCoordinates.y,
      }
      prevDraggingIdRef.current = draggingBlockId
    }, [blocksCoordinates, draggingBlockId, typebot?.blocks, graphPosition])

    useEffect(() => {
      editorContainerRef.current = document.getElementById(
        'editor-container'
      ) as HTMLDivElement
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (!graphContainerRef.current) return

      const { top, left } = graphContainerRef.current.getBoundingClientRect()

      setGlobalGraphPosition({
        x: left + debouncedGraphPosition.x,
        y: top + debouncedGraphPosition.y,
        scale: debouncedGraphPosition.scale,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedGraphPosition])

    const handleEventListeners = (e: any): void => {
      const event = e.data || e.data.name || ''
      if (event === 'backClick') {
        goToBegining()
      }
    }

    const zoom = useThrottledCallback(
      useCallback(
        (delta = zoomButtonsScaleStep, mousePosition?: Coordinates) => {
          const { x: mouseX, y } = mousePosition ?? { x: 800, y: 500 }

          const mouseY = y - headerHeight

          let scale = graphPosition.scale + delta

          if (
            (scale >= maxScale && graphPosition.scale === maxScale) ||
            (scale <= minScale && graphPosition.scale === minScale)
          )
            return

          scale =
            scale >= maxScale ? maxScale : scale <= minScale ? minScale : scale

          const xs = (mouseX - graphPosition.x) / graphPosition.scale

          const ys = (mouseY - graphPosition.y) / graphPosition.scale

          setGraphPosition({
            ...graphPosition,
            x: mouseX - xs * scale,
            y: mouseY - ys * scale,
            scale,
          })
        },
        [graphPosition]
      ),
      50
    )

    const handleMouseWheel = useCallback(
      (e: WheelEvent) => {
        e.preventDefault()

        const isPinchingTrackpad = e.ctrlKey

        if (isPinchingTrackpad) {
          zoom((e.deltaY > 0 ? -1 : 1) * zoomButtonsScaleStep, {
            x: e.clientX,
            y: e.clientY,
          })
          return
        }

        setGraphPosition((prev) => {
          const nextPosition = {
            ...prev,
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY,
          }

          if (draggingBlockId && lastMousePosRef.current && dragOffsetRef.current) {
            const mouseWorldAfter = {
              x: (lastMousePosRef.current.x - nextPosition.x) / prev.scale,
              y: (lastMousePosRef.current.y - nextPosition.y) / prev.scale,
            }

            updateBlockCoordinates(draggingBlockId, {
              x: mouseWorldAfter.x - dragOffsetRef.current.x,
              y: mouseWorldAfter.y - dragOffsetRef.current.y,
            })
          }

          return nextPosition
        })
      },
      [draggingBlockId, updateBlockCoordinates, zoom]
    )

    const handleMouseUp = useCallback(
      (e: MouseEvent) => {
        setIsMovingBoard(false)
        if (!typebot) return

        if (draggedItem) setDraggedItem(undefined)

        if (!draggedStep && !draggedStepType) return

        const coordinates = projectMouse(
          { x: e.clientX, y: e.clientY },
          graphPosition
        )

        const id = cuid()

        updateBlockCoordinates(id, coordinates)

        createBlock({
          id,
          ...coordinates,
          step: draggedStep ?? (draggedStepType as DraggableStepType),
          indices: { blockIndex: typebot.blocks.length, stepIndex: 0 },
        })

        setDraggedStep(undefined)

        setDraggedStepType(undefined)
      },
      [
        typebot,
        draggedItem,
        draggedStep,
        draggedStepType,
        graphPosition,
        updateBlockCoordinates,
        createBlock,
      ]
    )

    const handleCaptureMouseDown = (
      e: MouseEvent & { target: HTMLElement }
    ) => {
      const isRightClick = e.button === 2
      let elementId = e?.target?.id || e?.target?.parentElement?.id

      if (e?.target?.children && e?.target?.children[2] && !elementId)
        elementId = e?.target?.children[2]?.id

      if (isRightClick) e.stopPropagation()
      if (
        !isRightClick &&
        hideEdgesOn.some((id) => elementId?.startsWith(id))
      ) {
        setIsMovingBoard(true)
      }
    }

    const handleClick = () => {
      setOpenedStepId(undefined)

      setPreviewingEdge(undefined)
    }

    const onDrag = (_: DraggableEvent, draggableData: DraggableData) => {
      const { deltaX, deltaY } = draggableData

      setGraphPosition({
        ...graphPosition,
        x: graphPosition.x + deltaX,
        y: graphPosition.y + deltaY,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }

      if (draggingBlockId && dragOffsetRef.current) {
        const mouseWorld = {
          x: (e.clientX - graphPosition.x) / graphPosition.scale,
          y: (e.clientY - graphPosition.y) / graphPosition.scale,
        }

        updateBlockCoordinates(draggingBlockId, {
          x: mouseWorld.x - dragOffsetRef.current.x,
          y: mouseWorld.y - dragOffsetRef.current.y,
        })
      }

      if (!connectingIds)
        return autoMoveDirection ? setAutoMoveDirection(undefined) : undefined

      if (e.clientX <= 50) return setAutoMoveDirection('left')

      if (e.clientY <= 50 + headerHeight) return setAutoMoveDirection('top')

      if (e.clientX >= window.innerWidth - 50)
        return setAutoMoveDirection('right')

      if (e.clientY >= window.innerHeight - 50)
        return setAutoMoveDirection('bottom')

      setAutoMoveDirection(undefined)
    }

    useEventListener(() => graphContainerRef.current, 'wheel', handleMouseWheel)

    useEventListener(
      () => graphContainerRef.current,
      'mousedown',
      handleCaptureMouseDown,
      {
        capture: true,
      }
    )

    useEventListener(() => graphContainerRef.current, 'mouseup', handleMouseUp)

    useEventListener(() => editorContainerRef.current, 'click', handleClick)

    useEventListener(window, 'mousemove', handleMouseMove)

    const draggingStep = draggedStep || draggedStepType

    return (
      <DraggableCore onDrag={onDrag} enableUserSelectHack={false}>
        <Flex
          ref={graphContainerRef}
          position="relative"
          {...props}
          background={draggingStep || isMovingBoard ? 'gray.200' : '#ffffff'}
          backgroundImage="radial-gradient(#c6d0e1 1px, transparent 0)"
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
          cursor={isMovingBoard ? 'grabbing' : 'grab'}
        >
          <ZoomButtons
            onZoomIn={() => zoom(zoomButtonsScaleStep)}
            onZoomOut={() => zoom(-zoomButtonsScaleStep)}
          />

          <Stack
            pos="fixed"
            top={`calc(${headerHeight}px + 150px)`}
            right="40px"
            bgColor="white"
            rounded="md"
            zIndex={1}
            spacing="0"
            shadow="lg"
          >
            <Tooltip label="Undo">
              <IconButton
                display={['none', 'flex']}
                icon={<UndoIcon />}
                size="sm"
                aria-label="Undo"
                onClick={undo}
                isDisabled={!canUndo}
              />
            </Tooltip>

            <Tooltip label="Redo">
              <IconButton
                display={['none', 'flex']}
                icon={<RedoIcon />}
                size="sm"
                aria-label="Redo"
                onClick={redo}
                isDisabled={!canRedo}
              />
            </Tooltip>
          </Stack>

          <Flex
            id="graph-content"
            flex="1"
            w="full"
            h="full"
            position="absolute"
            style={{
              transform,
              transition: draggingBlockId ? '0s' : '0.1s',
            }}
            willChange="transform"
            transformOrigin="0px 0px 0px"
          >
            <GraphContent
              graphContainerRef={graphContainerRef}
              answersCounts={answersCounts}
              onUnlockProPlanClick={onUnlockProPlanClick}
            />
          </Flex>
        </Flex>
      </DraggableCore>
    )
  }
)

const projectMouse = (
  mouseCoordinates: Coordinates,
  graphPosition: Coordinates & { scale: number }
) => ({
  x:
    (mouseCoordinates.x -
      graphPosition.x -
      blockWidth / (3 / graphPosition.scale)) /
    graphPosition.scale,
  y:
    (mouseCoordinates.y -
      graphPosition.y -
      (headerHeight + 20 * graphPosition.scale)) /
    graphPosition.scale,
})

const useAutoMoveBoard = (
  autoMoveDirection: 'top' | 'right' | 'bottom' | 'left' | undefined,
  setGraphPosition: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      scale: number
    }>
  >
) =>
  useEffect(() => {
    if (!autoMoveDirection) return
    const interval = setInterval(() => {
      setGraphPosition((prev) => ({
        ...prev,
        x:
          autoMoveDirection === 'right'
            ? prev.x - 5
            : autoMoveDirection === 'left'
            ? prev.x + 5
            : prev.x,
        y:
          autoMoveDirection === 'bottom'
            ? prev.y - 5
            : autoMoveDirection === 'top'
            ? prev.y + 5
            : prev.y,
      }))
    }, 5)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMoveDirection])
