import { Flex, FormLabel, Spacer, Stack, Text } from '@chakra-ui/react'
import {
  TextBubbleContent,
  Variable,
  WhatsAppLocationRequestOptions,
} from 'models'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'

type WhatsAppLocationRequestSettingsBodyProps = {
  options: WhatsAppLocationRequestOptions
  onOptionsChange: (options: WhatsAppLocationRequestOptions) => void
}

const MAX_LENGTH_BODY = 1024

export const WhatsAppLocationRequestSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppLocationRequestSettingsBodyProps) => {
  const bodyLength = options.body?.content?.plainText?.length ?? 0

  const handleBodyText = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      body: { content },
    })
  }

  const handleVariableChange = (variable?: Variable) => {
    if (!variable || (!variable.id && !variable.variableId)) {
      onOptionsChange({
        ...options,
        property: undefined,
        variableId: undefined,
      })
      return
    }

    onOptionsChange({
      ...options,
      property: {
        domain: variable.domain,
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
      variableId: variable.variableId || variable.id,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" fontWeight="bold" fontSize="sm">
            Texto da pergunta
          </FormLabel>
          <Spacer />
          <FormLabel mb="0">
            {bodyLength}/{MAX_LENGTH_BODY}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
          maxLength={MAX_LENGTH_BODY}
        />
        <Text color="gray.500" fontSize="xs">
          O cliente recebe a pergunta com o botão &quot;Enviar localização&quot;
          do WhatsApp.
        </Text>
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
