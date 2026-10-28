import { Stack, Text } from '@chakra-ui/react'
import { WhatsAppCarouselStep } from 'models'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../../TextHtmlContent'

type Props = {
  step: WhatsAppCarouselStep
}

const WhatsAppCarouselContent = ({ step }: Props) => {
  const cardsCount = step.options?.cards?.length ?? 0
  const hasBody = Boolean(step.options?.body?.content?.plainText?.trim())

  if (!hasBody && !cardsCount) {
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
      <OctaDivider />
      <Text color="#5A6377" fontSize="sm">
        {cardsCount === 1 ? '1 card' : `${cardsCount} cards`}
      </Text>
    </Stack>
  )
}

export default WhatsAppCarouselContent
