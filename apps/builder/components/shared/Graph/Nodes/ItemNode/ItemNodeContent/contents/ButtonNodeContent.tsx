import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
} from '@chakra-ui/react'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, ItemIndices, ItemType } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { isNotDefined } from 'utils'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isMouseOver: boolean
  withControlButtons?: boolean
}

export const ButtonNodeContent = ({ item, indices, isMouseOver, withControlButtons = false }: Props) => {
  const defaultPlaceholder = 'Insira o texto desta resposta...' 

  const { deleteItem, updateItem, createItem } = useTypebot()
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
        <EditableInput px={4} py={2} readOnly={isReadOnly()} />
      </Editable>
      {withControlButtons && (
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
              shadow="md"
              colorScheme="gray"
              onClick={handlePlusClick}
            />
          )}
          {hasMoreThanOneItem() && !isReadOnly() && (
            <IconButton
              aria-label="Delete item"
              icon={<TrashIcon />}
              size="xs"
              shadow="md"
              colorScheme="gray"
              onClick={handleDeleteClick}
            />
          )}
        </Fade>
      )}
    </Flex>
  )
}
