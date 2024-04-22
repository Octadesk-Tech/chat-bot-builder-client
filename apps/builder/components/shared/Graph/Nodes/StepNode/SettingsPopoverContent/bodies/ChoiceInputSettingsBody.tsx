import { Flex, FormLabel, Spacer, Stack } from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ChoiceInputOptions, TextBubbleContent, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { FooterMessage } from 'components/shared/buttons/UploadButton.style'
import { inputPlaceholders } from '../../../helpers/helpers'
import { InputPlaceholders } from 'components/shared/interfaces/placeholders'

type ChoiceInputSettingsBodyProps = {
  options?: ChoiceInputOptions
  stepType: keyof InputPlaceholders
  onOptionsChange: (options: ChoiceInputOptions) => void
}

const MAX_LENGHT_TEXT = 500

export const ChoiceInputSettingsBody = ({
  options,
  stepType,
  onOptionsChange,
}: ChoiceInputSettingsBodyProps) => {
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    if (options) {
      onOptionsChange({
        ...options,
        message: content,
      })
    }
  }

  const handleVariableChange = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder">
            Texto da pergunta
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {options?.message?.plainText?.length ?? 0}/{MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          myEditableProps={{
            placeholder:
              inputPlaceholders[stepType] || 'Digite o texto da pergunta...',
          }}
          required={{ errorMsg: 'O campo "Texto da pergunta" é obrigatório' }}
          onClose={handleCloseEditorBotMessage}
          initialValue={options?.message ? options.message.richText : []}
          onKeyUp={handleCloseEditorBotMessage}
          maxLength={MAX_LENGHT_TEXT}
        />
        )
      </Stack>
      <FooterMessage>
        Edite as opções que enviaremos com essa pergunta diretamente na árvore
        ;)
      </FooterMessage>
      <Stack>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
