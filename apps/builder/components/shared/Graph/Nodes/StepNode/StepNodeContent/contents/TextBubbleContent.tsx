import { Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { EndConversationStep, TextBubbleStep } from 'models'
import React from 'react'
import { parseVariableHighlight } from 'services/utils'
import DOMPurify from 'dompurify'
import { textBubbleEditorContentConfig } from 'config/dompurify'

type Props = {
  step: TextBubbleStep | EndConversationStep
}

export const TextBubbleContent = ({ step }: Props) => {
  const { typebot } = useTypebot()
  const sanitizedHtml = DOMPurify.sanitize(
    step.content.html,
    textBubbleEditorContentConfig
  )

  if (!typebot) return <></>
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={step.content.html ? '1' : '0.5'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          sanitizedHtml
            ? parseVariableHighlight(sanitizedHtml, typebot)
            : `<p>Clique para editar...</p>`,
      }}
    />
  )
}
