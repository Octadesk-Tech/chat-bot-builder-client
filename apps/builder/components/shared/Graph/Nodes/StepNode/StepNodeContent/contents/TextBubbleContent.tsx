import { Flex } from '@chakra-ui/react'
import { useTypebotVariables } from 'contexts/TypebotContext'
import { EndConversationStep, TextBubbleStep, Typebot } from 'models'
import React from 'react'
import { parseVariableHighlight } from 'services/utils'
import { sanitizeBubbleHtml } from 'services/sanitizeHtml'

type Props = {
  step: TextBubbleStep | EndConversationStep
}

export const TextBubbleContent = ({ step }: Props) => {
  const variables = useTypebotVariables()
  const sanitizedHtml = sanitizeBubbleHtml(step.content.html)

  if (!variables) return <></>
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={step.content.html ? '1' : '0.5'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml
          ? parseVariableHighlight(sanitizedHtml, { variables } as Typebot)
          : `<p>Clique para editar...</p>`,
      }}
    />
  )
}
