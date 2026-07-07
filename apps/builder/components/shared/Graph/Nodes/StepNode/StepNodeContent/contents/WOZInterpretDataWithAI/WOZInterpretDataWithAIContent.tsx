import {
  StepIndices,
  StepWithItems,
  WOZInterpretDataWithAI,
  WOZInterpretDataWithAIResponseFormat,
} from 'models'
import React from 'react'
import { Stack, Text, Tag } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'

type Props = {
  step: WOZInterpretDataWithAI
  indices: StepIndices
}

const WOZInterpretDataWithAIContent = ({ step, indices }: Props) => {
  const hasConditionalEdges = (step.items?.length ?? 0) > 0

  return (
    <Stack>
      <Text noOfLines={0}>Clique para editar...</Text>
      <OctaDivider width="100%" />

      <Text>
        Enviar resposta como{' '}
        <Tag bg="purple.400" color="white">
          {step.content.responseFormat ===
          WOZInterpretDataWithAIResponseFormat.JSON
            ? 'JSON'
            : 'Mensagem natural'}
        </Tag>
      </Text>

      {hasConditionalEdges && (
        <>
          <OctaDivider width="100%" />
          <ItemNodesList
            step={step as unknown as StepWithItems}
            indices={indices}
            isReadOnly
          />
        </>
      )}
    </Stack>
  )
}

export default WOZInterpretDataWithAIContent
