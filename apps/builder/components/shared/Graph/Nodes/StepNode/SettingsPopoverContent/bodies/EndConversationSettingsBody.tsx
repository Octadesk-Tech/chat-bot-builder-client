import { FormLabel, Stack } from '@chakra-ui/react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor/TextBubbleEditor'
import { EndConversationStep, TextBubbleContent } from 'models'

type EndConversationSettingsBodyProps = {
  step: EndConversationStep
  onContentChange: (content: TextBubbleContent) => void
}

export const EndConversationSettingsBody = ({
  step,
  onContentChange,
}: EndConversationSettingsBodyProps) => {
  const handleContentChange = (content: TextBubbleContent) => {
    onContentChange(content)
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem de encerramento
        </FormLabel>
        <TextBubbleEditor
          initialValue={step.content?.richText || []}
          required={{ errorMsg: 'O campo "Mensagem de encerramento" é obrigatório' }}
          placeholder="Mensagem de encerramento."
          onClose={handleContentChange}
          onKeyUp={handleContentChange}
        />
      </Stack>
    </Stack>
  )
}

