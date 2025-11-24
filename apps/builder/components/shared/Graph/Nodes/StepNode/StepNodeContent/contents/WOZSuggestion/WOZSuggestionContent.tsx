import { WOZSuggestionStep } from 'models'
import React from 'react'
import { chakra, Stack, Text } from '@chakra-ui/react'

type Props = {
  step: WOZSuggestionStep
}

const WOZSuggestionContent = ({ step }: Props) => {
  return (
    <Stack>
      <Text noOfLines={0}>
        Mensagem será disparada pelo perfil do WOZ Agente que ativou a tarefa.
      </Text>
    </Stack>
  )
}

export default WOZSuggestionContent
