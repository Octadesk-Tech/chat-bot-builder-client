import { Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { CreateTicketOptions, CreateTicketStep, Variable } from 'models'
import React, { useEffect } from 'react'
import { WithVariableContent } from '../WithVariableContent'
import { useTypebot } from 'contexts/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'

type IProps = {
  step: CreateTicketStep,
  onUpdateStep: (options: CreateTicketOptions) => void
}

export const TicketCreateContent = ({ step, onUpdateStep }: IProps) => {
  const { typebot } = useTypebot()
  const { createCustomField } = useWorkspace()


  const handleDefaultTokenNotFound = async () => {
    if (step.options.initialVariableToken) {
      const splitedToken = step.options.initialVariableToken?.split('-')
      if (splitedToken) {
        const lastPortion = splitedToken.pop()
        const domain = lastPortion === 'contato' ? 'PERSON' : lastPortion === 'organizacao' ? 'ORGANIZATION' : ''
        const name = splitedToken.join('-').replace(/#/g, '')

        if (domain) {
          const domainVariables = typebot?.variables?.filter(v => v.domain === domain)

          if (domainVariables) {
            const domainProperty = domainVariables.find(
              property => property.name === name || property.name === 'customField.' + name
            )

            if (!domainProperty) createCustomField(name, domain)
          }
        }
      }
    }
  }

  const handleVariableChange = (variable: Variable) => {
    if (variable) {
      onUpdateStep({
        ...step.options, variableId: variable?.id, property: {
          domain: variable.domain,
          name: variable.name,
          type: variable.type ?? "string",
          token: variable.token
        }
      })
    }
  }

  useEffect(() => {
    if (!step?.options?.variableId && step.options.initialVariableToken) {
      const myVariable = typebot?.variables?.find(v => v.token === step.options.initialVariableToken)
      if (myVariable) {
        step.options.variableId = myVariable.id
        handleVariableChange(myVariable)
      } else {
        handleDefaultTokenNotFound()
      }
    }
  }, [typebot?.variables])

  return (
    <Stack>
      <Text color="#5A6377" >
        Configurar...
      </Text>
      <OctaDivider />

      <WithVariableContent variableId={step?.options?.variableId} property={step?.options?.property} />
    </Stack >
  )
}
