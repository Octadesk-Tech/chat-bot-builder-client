import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  SlideFade,
  Stack,
  useOutsideClick,
} from '@chakra-ui/react'
import React, { memo, useEffect, useRef, useState } from 'react'
import { Block } from 'models'
import { useBlockCoordinates, useGraph } from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/GraphDndContext'
import { StepNodesList } from '../StepNode/StepNodesList'
import { isDefined, isNotDefined } from 'utils'
import {
  useTypebotActions,
  useTypebotAvailableFor,
  useHasTypebot,
} from 'contexts/TypebotContext/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { useDebounce } from 'use-debounce'
import { setMultipleRefs } from 'services/utils'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import { BlockFocusToolbar } from './BlockFocusToolbar'
import { WarningTwoIcon } from '@chakra-ui/icons'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'

type Props = {
  block: Block
  blockIndex: number
  simplified?: boolean
}

export const BlockNode = memo(({ block, blockIndex, simplified }: Props) => {
  const {
    connectingIds,
    setConnectingIds,
    previewingEdge,
    updateBlockCoordinates,
    isReadOnly,
    focusedBlockId,
    setFocusedBlockId,
    getGraphPosition,
    setDraggingBlockId,
  } = useGraph()

  const blockCoordinates = useBlockCoordinates(block.id)

  const { updateBlock, deleteBlock, duplicateBlock } = useTypebotActions()
  const availableFor = useTypebotAvailableFor()
  const hasTypebot = useHasTypebot()

  const { setMouseOverBlock, mouseOverBlock } = useStepDnd()

  useEffect(() => {
    return () => {
      setMouseOverBlock((prev) => (prev?.id === block.id ? undefined : prev))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isMouseDown, setIsMouseDown] = useState(false)

  const [isConnecting, setIsConnecting] = useState(false)

  const [isFocused, setIsFocused] = useState(false)

  const availableOnlyForEvent =
    availableFor?.length == 1 && availableFor.includes('event')

  const showWarning = !availableOnlyForEvent

  const isPreviewing =
    previewingEdge?.from.blockId === block.id ||
    (previewingEdge?.to.blockId === block.id &&
      isNotDefined(previewingEdge.to.stepId))

  const isStartBlock =
    isDefined(block.steps[0]) && block.steps[0].type === 'start'

  const blockRef = useRef<HTMLDivElement | null>(null)

  const [debouncedBlockPosition] = useDebounce(blockCoordinates, 500)

  useEffect(() => {
    if (!debouncedBlockPosition || isReadOnly) return

    if (
      debouncedBlockPosition?.x === block.graphCoordinates.x &&
      debouncedBlockPosition.y === block.graphCoordinates.y
    )
      return

    updateBlock(blockIndex, { graphCoordinates: debouncedBlockPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBlockPosition])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.blockId === block.id &&
        isNotDefined(connectingIds.target?.stepId)
    )
  }, [block.id, connectingIds])

  const handleTitleSubmit = (title: string) =>
    updateBlock(blockIndex, { title })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleMouseEnter = () => {
    if (isReadOnly) return

    if (mouseOverBlock?.id !== block.id && !isStartBlock)
      setMouseOverBlock({ id: block.id, ref: blockRef })

    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { blockId: block.id } })
  }

  const handleMouseLeave = () => {
    if (isReadOnly) return

    setMouseOverBlock(undefined)

    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  const onDrag = (_: DraggableEvent, draggableData: DraggableData) => {
    _.preventDefault()

    if (!blockCoordinates) return

    const { deltaX, deltaY } = draggableData

    const { scale } = getGraphPosition()

    updateBlockCoordinates(block.id, {
      x: blockCoordinates.x + deltaX / scale,
      y: blockCoordinates.y + deltaY / scale,
    })
  }

  const onDragStart = () => {
    setFocusedBlockId(block.id)
    setDraggingBlockId(block.id)
    setIsMouseDown(true)
  }

  useOutsideClick({
    handler: () => setIsFocused(false),
    ref: blockRef,
  })

  const onDragStop = () => {
    setIsMouseDown(false)
    setDraggingBlockId(undefined)
  }

  const stackBorderColor = (isOpened: boolean): string => {
    if (hasWarning) {
      return 'yellow.500'
    } else if (isConnecting || isOpened || isPreviewing || isFocused) {
      return 'blue.400'
    }

    return '#ffffff'
  }

  const hasWarning = !block.hasConnection && showWarning
  const showEmptyConnectionAlert = () => !block.hasConnection && showWarning
  const isAutomatedTasksBot = availableFor?.includes('automated-tasks')
  const emptyConnectionMessage = `Este bloco precisa se conectar e/ou receber uma conexão de outro bloco.`

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <BlockNodeContextMenu blockIndex={blockIndex} />}
      isDisabled={isReadOnly || isStartBlock}
    >
      {(ref, isOpened) => (
        <div onClick={() => setIsFocused(true)}>
          <DraggableCore
            enableUserSelectHack={false}
            onDrag={onDrag}
            onStart={onDragStart}
            onStop={onDragStop}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Stack
              id={`block-node-${block?.id}`}
              ref={setMultipleRefs([ref, blockRef])}
              data-testid="block"
              p="4"
              rounded="xl"
              bgColor="#ffffff"
              borderWidth="2px"
              maxWidth={simplified ? '200px' : '313px'}
              minWidth={simplified ? '313px' : undefined}
              minHeight={simplified ? '200px' : undefined}
              borderColor={stackBorderColor(isOpened)}
              transition="border 300ms, box-shadow 200ms"
              pos="absolute"
              style={{
                transform: `translate(${blockCoordinates?.x ?? 0}px, ${
                  blockCoordinates?.y ?? 0
                }px)`,
                userSelect: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              cursor={isMouseDown ? 'grabbing' : 'pointer'}
              shadow="md"
              _hover={{ shadow: 'lg' }}
              zIndex={focusedBlockId === block.id ? 10 : 1}
              className={
                isAutomatedTasksBot &&
                !hasWarning &&
                block.steps[0].type !== 'start'
                  ? 'gradient-border-woz'
                  : ''
              }
            >
              {simplified ? (
                <div
                  title={block.title}
                  style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    padding: '0 4px',
                    color: '#1B2A4A',
                  }}
                >
                  {block.title || 'Sem título'}
                </div>
              ) : (
                <Flex justifyContent="space-between" alignItems="center" gap="2">
                <Editable
                  defaultValue={block.title}
                  onSubmit={handleTitleSubmit}
                  fontWeight="semibold"
                  pointerEvents={isReadOnly || isStartBlock ? 'none' : 'auto'}
                >
                  <EditablePreview
                    _hover={{ bgColor: 'gray.200' }}
                    px="1"
                    userSelect={'none'}
                  />

                  <EditableInput
                    minW="0"
                    px="1"
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </Editable>

                {showEmptyConnectionAlert() && (
                  <OctaTooltip
                    contentText={emptyConnectionMessage}
                    tooltipPlacement={'auto'}
                    popoverColor="#303243"
                    textColor="#F4F4F5"
                    duration={3000}
                    element={<WarningTwoIcon color="#FAC300" />}
                  />
                )}
              </Flex>
            )
            }

              {hasTypebot &&
                (simplified ? (
                  <Stack spacing="2">
                    {block.steps.map((step) => (
                      <div
                        key={step.id}
                        style={{
                          backgroundColor: '#E2E8F0',
                          borderRadius: '6px',
                          width: '100%',
                          height: '120px',
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <StepNodesList
                    blockId={block.id}
                    steps={block.steps}
                    blockIndex={blockIndex}
                    blockRef={ref}
                    isStartBlock={isStartBlock}
                  />
                ))}

              {isFocused && !isStartBlock && (
                <SlideFade
                  in={isFocused}
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    right: 0,
                  }}
                  unmountOnExit
                >
                  <BlockFocusToolbar
                    onDuplicateClick={() => {
                      setIsFocused(false)
                      duplicateBlock(blockIndex)
                    }}
                    onDeleteClick={() => deleteBlock(blockIndex)}
                  />
                </SlideFade>
              )}
            </Stack>
          </DraggableCore>
        </div>
      )}
    </ContextMenu>
  )
})
