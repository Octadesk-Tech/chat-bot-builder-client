import { FormLabel, Stack } from "@chakra-ui/react"
import { TextBubbleEditor } from "components/shared/Graph/Nodes/StepNode/TextBubbleEditor/TextBubbleEditor"
import { TextBubbleContent, TextBubbleStep } from "models"

type TextSettingsBodyProps = {
  step: TextBubbleStep
  onContentChange: (content: TextBubbleContent) => void
}

export const TextSettingsBody = ({
  step,
  onContentChange,
}: TextSettingsBodyProps) => {
  const handleContentChange = (content: TextBubbleContent) => {
    onContentChange(content)
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Texto da mensagem
        </FormLabel>
        <TextBubbleEditor
          initialValue={step.content.richText}
          required={{ errorMsg: 'O campo "Texto da mensagem" é obrigatório' }}
          placeholder="Insira aqui uma mensagem de texto..."
          onClose={handleContentChange}
          onKeyUp={handleContentChange}
        />
      </Stack>
    </Stack>
  )
}