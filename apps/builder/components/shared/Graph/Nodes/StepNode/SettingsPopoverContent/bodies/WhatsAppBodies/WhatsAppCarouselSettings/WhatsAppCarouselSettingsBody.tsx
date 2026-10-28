import {
  Button,
  Flex,
  FormLabel,
  Icon,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  TextBubbleContent,
  WhatsAppCarouselCard,
  WhatsAppCarouselOptions,
} from 'models'
import { useEffect, useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import cuid from 'cuid'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { WhatsAppCarouselCardForm } from './WhatsAppCarouselCardForm'

type WhatsAppCarouselSettingsBodyProps = {
  options: WhatsAppCarouselOptions
  onOptionsChange: (options: WhatsAppCarouselOptions) => void
}

export const MIN_CAROUSEL_CARDS = 2
export const MAX_CAROUSEL_CARDS = 10
const MAX_LENGTH_BODY = 1024

const createCard = (): WhatsAppCarouselCard => ({
  id: cuid(),
  buttonText: '',
  url: '',
})

export const WhatsAppCarouselSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppCarouselSettingsBodyProps) => {
  const [initialCards] = useState(() =>
    Array.from({ length: MIN_CAROUSEL_CARDS }, createCard)
  )
  const latestOptions = useRef(options)

  useEffect(() => {
    latestOptions.current = options
  }, [options])

  const resolveCards = (current: WhatsAppCarouselOptions) =>
    current.cards?.length ? current.cards : initialCards

  const cards = resolveCards(options)
  const canAddCard = cards.length < MAX_CAROUSEL_CARDS
  const canRemoveCard = cards.length > MIN_CAROUSEL_CARDS
  const bodyLength = options.body?.content?.plainText?.length ?? 0

  const commit = (changes: Partial<WhatsAppCarouselOptions>) => {
    const next = { ...latestOptions.current, ...changes }
    latestOptions.current = next
    onOptionsChange(next)
  }

  const commitCards = (
    update: (cards: WhatsAppCarouselCard[]) => WhatsAppCarouselCard[]
  ) => {
    commit({ cards: update(resolveCards(latestOptions.current)) })
  }

  const handleBodyText = (content: TextBubbleContent) => {
    commit({ body: { content } })
  }

  const handleCardChange = (
    cardId: string,
    changes: Partial<WhatsAppCarouselCard>
  ) => {
    commitCards((current) =>
      current.map((card) =>
        card.id === cardId ? { ...card, ...changes } : card
      )
    )
  }

  const handleRemoveCard = (cardId: string) => {
    commitCards((current) =>
      current.length > MIN_CAROUSEL_CARDS
        ? current.filter((card) => card.id !== cardId)
        : current
    )
  }

  const handleAddCard = () => {
    commitCards((current) =>
      current.length < MAX_CAROUSEL_CARDS ? [...current, createCard()] : current
    )
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" fontWeight="bold" fontSize="sm">
            Texto da mensagem
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
      </Stack>

      <Stack spacing={3}>
        <FormLabel mb="0" fontWeight="bold" fontSize="sm">
          Cards
        </FormLabel>
        <Text color="gray.500" fontSize="xs">
          De {MIN_CAROUSEL_CARDS} a {MAX_CAROUSEL_CARDS} cards, todos com o
          mesmo tipo de mídia (só imagens ou só vídeos).
        </Text>

        {cards.map((card, index) => (
          <WhatsAppCarouselCardForm
            key={card.id}
            card={card}
            index={index}
            canRemove={canRemoveCard}
            onChange={handleCardChange}
            onRemove={handleRemoveCard}
          />
        ))}

        <Flex justify="center">
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddCard}
            variant="outline"
            size="md"
            color={canAddCard ? '#1366C9' : 'gray.400'}
            borderColor={canAddCard ? '#1366C9' : 'gray.300'}
            borderWidth="2px"
            fontSize="sm"
            _hover={canAddCard ? { bg: '#1366C9', color: 'white' } : {}}
            _disabled={{ opacity: 1, cursor: 'not-allowed' }}
            isDisabled={!canAddCard}
          >
            Adicionar card
          </Button>
        </Flex>
      </Stack>
    </Stack>
  )
}
