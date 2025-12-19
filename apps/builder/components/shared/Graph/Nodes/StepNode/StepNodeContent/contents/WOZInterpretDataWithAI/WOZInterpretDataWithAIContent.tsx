import { WOZInterpretDataWithAI } from 'models'
import React from 'react'
import { Stack, Text, Tag } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'

type Props = {
  step: WOZInterpretDataWithAI
}

const WOZInterpretDataWithAIContent = ({ step }: Props) => {
  return (
    <Stack>
      <Text noOfLines={0}>Clique para editar...</Text>
      <OctaDivider width="100%" />

      <Text>
        Enviar resposta como{' '}
        <Tag bg="purple.400" color="white">
          JSON
        </Tag>
      </Text>
    </Stack>
  )
}

export default WOZInterpretDataWithAIContent
