import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { SetVariableStep } from 'models'
import { byId } from 'utils'

export const SetVariableContent = ({ step }: { step: SetVariableStep }) => {
  const { typebot } = useTypebot()
  const variableToken =
    step.options.property?.token ??
    typebot?.variables.find(byId(step.options.variableId ?? ''))?.token ??
    ''

  if (variableToken === '') {
    return (
      <Text color={'gray.500'} noOfLines={2}>
        Clique para editar...
      </Text>
    )
  }

  return (
    <Text color={'gray.500'} noOfLines={2}>
      Definir {variableToken} {step.options.isCode ? '(código)' : '(texto)'}
    </Text>
  )
}
