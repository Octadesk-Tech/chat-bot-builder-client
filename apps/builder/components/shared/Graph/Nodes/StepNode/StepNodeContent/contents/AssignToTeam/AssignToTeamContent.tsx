import React from 'react'
import { chakra, Text, Stack, Flex } from '@chakra-ui/react'
import { AssignToTeamOptions, Assign, AssignToTeamStep } from 'models'
import { SourceEndpoint } from '../../../../../Endpoints'
import { TableListOcta } from 'components/shared/TableListOcta'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { ASSIGN_TO } from 'enums/assign-to'
import { useTypebot } from 'contexts/TypebotContext'
import { parseVariableHighlight } from 'services/utils'
import { TextHtmlContent } from '../TextHtmlContent'
import { hasAnyChatReturnInItsTree } from './hasAnyChatReturnInItsTree'
import { useUser } from 'contexts/UserContext'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  step: AssignToTeamStep
  onUpdateStep: (options: AssignToTeamOptions) => void
}

export const AssignToTeamContent = ({
  step, onUpdateStep
}: Props) => {
  const { octaAgents, typebot } = useTypebot();
  const { verifyFeatureToggle } = useUser()

  React.useEffect(() => {
    if (
      !verifyFeatureToggle('customer-recontact') 
      || typeof onUpdateStep !== 'function'
    ) return
    
    const showChatReturnOption = hasAnyChatReturnInItsTree(typebot, step.blockId)
    let options = {} as AssignToTeamOptions
    if (!showChatReturnOption && step.options?.assignType === '@CHAT-RETURN') {
      options.assignTo = ''
      options.assignType = ''
    }
    
    onUpdateStep({
      ...step.options, ... options, showChatReturnOption
    })
  }, [typebot?.edges])

  const resolveAssignTo = (assignTo: string) => {
    const value = octaAgents.find(s => s.id === assignTo)
    return value?.name
  }

  const resolveAssignType = (assignType: string, subType: string) => {
    if (assignType === ASSIGN_TO.group) return 'grupo'
    else if (assignType === ASSIGN_TO.agent) {
      if (subType === 'RESPONSIBLE_CONTACT') return 'responsável'
      else return 'agente'
    }
    else return 'time'
  }

  return (
    <Stack>
      <TextHtmlContent html={
        step.options.messages?.firstMessage?.content?.html && (step.options.assignTo || step.options.assignType === ASSIGN_TO.noOne) ?
          step.options.messages?.firstMessage?.content?.html : undefined} />

      <OctaDivider />
      <Text>
        <span>Atribuir conversa para {resolveAssignType(step.options.assignType, step.options.subType)}</span>
      </Text>
      {step.options.assignTo &&
        <chakra.span
          w={"100%"}
          gap={"8px"}
          bgColor="orange.400"
          color="white"
          rounded="md"
          py="0.5"
          px="1"
        >
          {
          step?.options?.assignType === ASSIGN_TO.chatReturn ? 
          'Retorno de atendimento' 
          : 
          resolveAssignTo(step.options.assignTo)
          }
        </chakra.span>
      }
      <OctaDivider />
      <Text fontSize={"13px"} align={"center"} color={"blue"}>
        <span>Ver mais detalhes</span>
      </Text>
    </Stack>
  )
}
