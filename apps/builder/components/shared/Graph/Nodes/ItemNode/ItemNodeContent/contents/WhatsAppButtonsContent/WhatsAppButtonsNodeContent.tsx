import { Flex, Input } from '@chakra-ui/react'
import { Item } from 'models'
import React, { useContext } from 'react'
import { StepNodeContext } from 'components/shared/Graph/Nodes/StepNode/StepNode/StepNode'

type Props = {
  item: Item
  onUpdateItem?: (value: string) => void
}

const MAX_LENGTH_BUTTON_TEXT = 20

export const WhatsAppButtonsNodeContent = ({ item, onUpdateItem }: Props) => {
  const { setIsModalOpen } = useContext(StepNodeContext)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdateItem) {
      onUpdateItem(e.target.value || '')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (setIsModalOpen) {
      setIsModalOpen(true)
    }
  }

  const contentValue = typeof item.content === 'string' 
    ? item.content 
    : (item as any)?.text || (item.content as any)?.text || ''

  return (
    <Flex justify="center" w="100%" pos="relative">
      <Input
        placeholder="Insira o texto desta resposta..."
        value={contentValue}
        onChange={handleChange}
        onClick={handleClick}
        maxLength={MAX_LENGTH_BUTTON_TEXT}
        bg="white"
        size="md"
        focusBorderColor="blue.400"
        border="none"
        w="full"
        _focus={{ boxShadow: 'none' }}
      />
    </Flex>
  )
}
