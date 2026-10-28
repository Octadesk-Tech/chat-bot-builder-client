import { Stack, Text } from '@chakra-ui/react'
import { WhatsAppLocationRequestStep } from 'models'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WithVariableContent } from '../../WithVariableContent'
import { TextHtmlContent } from '../../TextHtmlContent'

type Props = {
  step: WhatsAppLocationRequestStep
}

const WhatsAppLocationRequestContent = ({ step }: Props) => {
  const hasBody = Boolean(step.options?.body?.content?.plainText?.trim())
  const hasVariable = Boolean(
    step.options?.variableId?.trim() || step.options?.property?.token?.trim()
  )

  if (!hasBody && !hasVariable) {
    return (
      <Stack spacing={2}>
        <Text color="gray.500" fontSize="sm">
          Clique para editar...
        </Text>
      </Stack>
    )
  }

  return (
    <Stack>
      <TextHtmlContent
        html={step.options?.body?.content?.html}
        color="#5A6377"
        defaultPlaceholder="Configurar..."
      />
      {hasVariable && (
        <>
          <OctaDivider />
          <WithVariableContent
            variableId={step.options?.variableId}
            property={step.options?.property}
          />
        </>
      )}
    </Stack>
  )
}

export default WhatsAppLocationRequestContent
