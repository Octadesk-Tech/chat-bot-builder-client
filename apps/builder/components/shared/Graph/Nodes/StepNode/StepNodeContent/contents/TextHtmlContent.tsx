import { Flex } from '@chakra-ui/react'
import { textBubbleEditorContentConfig } from 'config/dompurify'
import { useTypebotVariables } from 'contexts/TypebotContext'
import { Typebot } from 'models'
import DOMPurify from 'dompurify'
import { parseVariableHighlight } from 'services/utils'

type Props = {
  html?: string
  defaultPlaceholder?: string
  renderIfEmpty?: boolean
  fontSize?: string
  fontWeight?: string
  color?: string
}

export const TextHtmlContent = ({
  html,
  defaultPlaceholder,
  renderIfEmpty = true,
  fontSize,
  fontWeight,
  color,
}: Props) => {
  const variables = useTypebotVariables()
  const sanitizedHtml = DOMPurify.sanitize(html, textBubbleEditorContentConfig)

  return !renderIfEmpty && !sanitizedHtml ? (
    <></>
  ) : (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          sanitizedHtml && variables
            ? parseVariableHighlight(sanitizedHtml, { variables } as Typebot)
            : `<p>${defaultPlaceholder || 'Configurar...'}</p>`,
      }}
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
    />
  )
}
