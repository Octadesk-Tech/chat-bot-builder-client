import { Flex, Text } from '@chakra-ui/react'
import { Item } from 'models'
import React, { useContext } from 'react'
import { StepNodeContext } from 'components/shared/Graph/Nodes/StepNode/StepNode'

type Props = {
  item: Item
}

export const WhatsAppOptionsNodeContent = ({ item }: Props) => {
  const { setIsModalOpen } = useContext(StepNodeContext)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (setIsModalOpen) {
      setIsModalOpen(true)
    }
  }

  return (
    <Flex justify="center" w="100%" pos="relative">
      <Text
        w="full"
        color={item.content ? 'inherit' : 'gray.500'}
        px={4}
        py={2}
        cursor="pointer"
        onClick={handleClick}
      >
        {item.content || 'Editar opção'}
      </Text>
    </Flex>
  )
}
