import { chakra, Flex, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { OctaProperty, Variable } from 'models'
import { useWorkspace } from 'contexts/WorkspaceContext'

type Props = {
  variableId?: string
  property?: OctaProperty
}

export const WithVariableContent = ({ variableId, property }: Props) => {
  const { typebot } = useTypebot()
  const { createChatField } = useWorkspace()

  const [variableName, setVariableName] = useState<string>('')

  useEffect(() => {
    const hasValidVariableId = variableId && variableId.trim() !== ''

    if (!hasValidVariableId) {
      setVariableName('')
      return
    }

    if (typebot?.variables) {
      const variable = typebot.variables.find(
        (v) => v.variableId === variableId || v.id === variableId || v.token === variableId
      )

      if (!variable && property?.token && property.token.trim() !== '') {
        createChatField(property, variableId)
        setVariableName(property.token)
      } else if (variable) {
        setVariableName(variable.token)
      } else {
        setVariableName('')
      }
    } else {
      setVariableName('')
    }
  }, [typebot?.variables, variableId, property])

  if (!variableName || variableName.trim() === '') {
    return null
  }

  return (
    <Flex alignItems="center" gap={2}>
      <Text color="#5A6377" fontWeight="medium" whiteSpace="nowrap">
        Salvar resposta em
      </Text>
      <chakra.span
        display="inline-block"
        flex="1"
        bgColor="orange.400"
        color="white"
        rounded="md"
        py="0.5"
        px="1.5"
        fontSize="sm"
        fontWeight="medium"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {variableName}
      </chakra.span>
    </Flex>
  )
}
