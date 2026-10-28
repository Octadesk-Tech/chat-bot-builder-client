import {
  Box,
  Flex,
  FormLabel,
  IconButton,
  Input,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  TextBubbleContent,
  WhatsAppCarouselCard,
  WhatsAppCarouselMediaType,
} from 'models'
import { TrashIcon } from 'assets/icons'
import { UploadButton } from 'components/shared/buttons/UploadButton'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { RenderContent } from 'components/shared/Graph/Nodes/StepNode/StepNodeContent/contents/MediaInput/MediaInputContent'

type Props = {
  card: WhatsAppCarouselCard
  index: number
  canRemove: boolean
  onChange: (cardId: string, changes: Partial<WhatsAppCarouselCard>) => void
  onRemove: (cardId: string) => void
}

export const MAX_LENGTH_CARD_TEXT = 160
export const MAX_LENGTH_CARD_BUTTON = 20

const CAROUSEL_MEDIA_ACCEPT = '.jpg, .jpeg, .png, .mp4'

const resolveMediaType = (fileType: string): WhatsAppCarouselMediaType =>
  fileType.startsWith('video/') ? 'video' : 'image'

export const WhatsAppCarouselCardForm = ({
  card,
  index,
  canRemove,
  onChange,
  onRemove,
}: Props) => {
  const textLength = card.text?.content?.plainText?.length ?? 0

  const handleMediaUploaded = (
    url: string,
    type: string,
    name: string,
    size: number
  ) => {
    onChange(card.id, {
      media: { url, type: resolveMediaType(type), name, size },
    })
  }

  const handleText = (content: TextBubbleContent) => {
    onChange(card.id, { text: { content } })
  }

  const handleButtonText = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(card.id, { buttonText: e.target.value })
  }

  const handleUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(card.id, { url: e.target.value.trim() })
  }

  const handleRemove = () => {
    onRemove(card.id)
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={3}>
      <Stack spacing={3}>
        <Flex align="center">
          <Text fontWeight="bold" fontSize="sm">
            Card {index + 1}
          </Text>
          <Spacer />
          <IconButton
            aria-label="Remover card"
            icon={<TrashIcon />}
            size="sm"
            variant="ghost"
            isDisabled={!canRemove}
            onClick={handleRemove}
          />
        </Flex>

        <Stack>
          <FormLabel mb="0" fontWeight="bold" fontSize="sm">
            Imagem ou vídeo
          </FormLabel>
          {card.media?.url && (
            <RenderContent
              url={card.media.url}
              containsVariables={false}
              fullImage={true}
              name={card.media.name}
              size={card.media.size}
            />
          )}
          <UploadButton
            accept={CAROUSEL_MEDIA_ACCEPT}
            onFileUploaded={handleMediaUploaded}
            includeFileName
            colorScheme="blue"
          >
            {card.media?.url ? 'Trocar arquivo' : 'Selecione um arquivo'}
          </UploadButton>
        </Stack>

        <Stack>
          <Flex>
            <FormLabel mb="0" fontWeight="bold" fontSize="sm">
              Texto do card
            </FormLabel>
            <Spacer />
            <FormLabel mb="0">
              {textLength}/{MAX_LENGTH_CARD_TEXT}
            </FormLabel>
          </Flex>
          <TextBubbleEditor
            onClose={handleText}
            initialValue={card.text?.content ? card.text.content.richText : []}
            onKeyUp={handleText}
            maxLength={MAX_LENGTH_CARD_TEXT}
          />
        </Stack>

        <Stack>
          <Flex>
            <FormLabel mb="0" fontWeight="bold" fontSize="sm">
              Texto do botão
            </FormLabel>
            <Spacer />
            <FormLabel mb="0">
              {card.buttonText.length}/{MAX_LENGTH_CARD_BUTTON}
            </FormLabel>
          </Flex>
          <Input
            placeholder="Ex.: Ver oferta"
            value={card.buttonText}
            onChange={handleButtonText}
            maxLength={MAX_LENGTH_CARD_BUTTON}
            size="md"
            focusBorderColor="blue.400"
          />
        </Stack>

        <Stack>
          <FormLabel mb="0" fontWeight="bold" fontSize="sm">
            Link do botão
          </FormLabel>
          <Input
            placeholder="https://"
            value={card.url}
            onChange={handleUrl}
            size="md"
            focusBorderColor="blue.400"
          />
        </Stack>
      </Stack>
    </Box>
  )
}
