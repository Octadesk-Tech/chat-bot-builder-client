import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
  Text,
} from '@chakra-ui/react'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, ItemIndices, ItemType } from 'models'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { isNotDefined } from 'utils'
import { StepNodeContext } from '../../../StepNode/StepNode/StepNode'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isMouseOver: boolean
  withControlButtons?: boolean
}

export const ButtonNodeContent = ({ item, indices, isMouseOver }: Props) => {
  const { deleteItem, updateItem, createItem, typebot } = useTypebot()
  const { setOpenedStepId, setFocusedBlockId } = useGraph()
  const { setIsModalOpen } = useContext(StepNodeContext)
  const [initialContent] = useState(item.content ?? '')
  const [itemValue, setItemValue] = useState(
    item.content ?? defaultPlaceholder
  )
  const editableRef = useRef<HTMLDivElement | null>(null)

  const { canAddItem = true } = item

  useEffect(() => {
    if (itemValue !== item.content)
      setItemValue(item.content ?? defaultPlaceholder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else
      updateItem(indices, { content: itemValue === '' ? undefined : itemValue })
  }

  const hasMoreThanOneItem = () => indices.itemsCount && indices.itemsCount > 1

  const isReadOnly = () => {
    return !!item.readonly
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === 'Escape' &&
      itemValue === defaultPlaceholder &&
      hasMoreThanOneItem()
    )
      deleteItem(indices)
    if (e.key === 'Enter' && itemValue !== '' && initialContent === '')
      handlePlusClick()
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    createItem(
      { stepId: item.stepId, type: ItemType.BUTTON },
      { ...indices, itemIndex }
    )
  }

  const handleDeleteClick = () => {
    deleteItem(indices)
  }

  const canAddItemFn = canAddItem && item.content !== 'Encerrar a conversa'

  const handleReadOnlyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.stepId && typebot) {
      const blockId = typebot.blocks[indices.blockIndex]?.id
      if (blockId) {
        setFocusedBlockId(blockId)
      }
      setIsModalOpen?.(true)
      setOpenedStepId(item.stepId)
    }
  }

  if (isReadOnly()) {
    return (
      <Flex justify="center" w="100%" pos="relative">
        <Text
          w="full"
          px={4}
          py={2}
          color="inherit"
          cursor="pointer"
          userSelect="none"
          onClick={(e) => handleReadOnlyClick(e)}
        >
          {item.content}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex justify="center" w="100%" pos="relative">
      <Editable
        ref={editableRef}
        startWithEditView={false}
        value={itemValue}
        onChange={setItemValue}
        onSubmit={handleInputSubmit}
        onKeyDownCapture={handleKeyPress}
        flex={2}
        w="full"
      >
        <EditablePreview
          w="full"
          color={
            item.content !== defaultPlaceholder ? 'inherit' : 'gray.500'
          }
          cursor="pointer"
          px={4}
          py={2}
        />
        <EditableInput px={4} py={2} />
      </Editable>
      <Fade
        in={isMouseOver}
        style={{
          position: 'absolute',
          bottom: '-15px',
          zIndex: 3,
          left: '90px',
        }}
        unmountOnExit
      >
        {canAddItemFn && (
          <IconButton
            aria-label="Add item"
            icon={<PlusIcon />}
            size="xs"
            colorScheme="gray"
            onClick={handlePlusClick}
          />
        )}
        {canAddItem && hasMoreThanOneItem() && (
          <IconButton
            aria-label="Delete item"
            icon={<TrashIcon />}
            size="xs"
            colorScheme="gray"
            onClick={handleDeleteClick}
          />
        )}
      </Fade>
    </Flex>
  )
}
