import {
  EditablePreview,
  EditableInput,
  Editable,
  Flex,
} from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, ItemIndices, ItemType } from 'models'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  onUpdateItem?: (value: string) => void
}

export const ButtonNodeContent = ({ item, indices, onUpdateItem }: Props) => {
  const defaultPlaceholder = 'Insira o texto desta resposta...' 

  const { deleteItem, updateItem, createItem } = useTypebot()
  const [initialContent] = useState(item.content ?? '')
  const [itemValue, setItemValue] = useState(
    item.content ?? defaultPlaceholder
  )
  const editableRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (itemValue !== item.content)
      setItemValue(item.content ?? defaultPlaceholder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else {
      const newValue = itemValue === '' ? undefined : itemValue
      updateItem(indices, { content: newValue })
      if (onUpdateItem) {
        onUpdateItem(newValue || '')
      }
    }
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
        <EditableInput px={4} py={2} readOnly={isReadOnly()} _focus={{ borderColor: 'gray.400' }} />
      </Editable>
    </Flex>
  )
}
