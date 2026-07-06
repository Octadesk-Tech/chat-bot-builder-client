import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { ItemType, Step, StepIndices, WOZInterpretDataWithAI } from 'models'
import cuid from 'cuid'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { MdAdd, MdInfoOutline, MdClose } from 'react-icons/md'

import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: WOZInterpretDataWithAI
  indices: StepIndices
  onStepChange: (updates: Partial<Step>) => void
}

type ConditionalEdgeItem = {
  id: string
  stepId: string
  type: ItemType
  content: string
  outgoingEdgeId?: string
}

const DEFAULT_ITEM_COUNT = 2

const createEmptyItem = (stepId: string): ConditionalEdgeItem => ({
  id: cuid(),
  stepId,
  type: ItemType.BUTTON,
  content: '',
})

const ConditionalEdges = ({ step, indices }: Props) => {
  const { deleteEdge, updateStep } = useTypebot()
  const initialItems = (step.items ?? []) as unknown as ConditionalEdgeItem[]
  const [items, setItems] = useState<ConditionalEdgeItem[]>(initialItems)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const tooltipText =
    "Ative para criar múltiplos caminhos no fluxo. Nomeie as saídas abaixo e ensine a IA a escolher entre elas através do campo '<b>Instrução de formatação</b>' acima."

  const stepRef = useRef(step)
  stepRef.current = step

  const isEnabled = items.length > 0

  const persist = (nextItems: ConditionalEdgeItem[]) => {
    setItems(nextItems)
    updateStep(indices, { items: nextItems } as unknown as Partial<Step>)
  }

  const deleteEdgeRef = useRef(deleteEdge)
  deleteEdgeRef.current = deleteEdge

  const updateStepRef = useRef(updateStep)
  updateStepRef.current = updateStep

  const indicesRef = useRef(indices)
  indicesRef.current = indices

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const existingEdgeId = stepRef.current.outgoingEdgeId
      if (existingEdgeId) deleteEdge(existingEdgeId)
      const newItems = Array.from({ length: DEFAULT_ITEM_COUNT }, () =>
        createEmptyItem(stepRef.current.id)
      )
      persist(newItems)
    } else {
      items.forEach((it) => {
        if (it.outgoingEdgeId) deleteEdge(it.outgoingEdgeId)
      })
      setItems([])
      updateStep(indices, { items: undefined })
    }
  }

  const handleUpdateItem = (index: number, content: string) => {
    const next = items.map((it, i) => (i === index ? { ...it, content } : it))
    persist(next)
  }

  const handleAddItem = () => {
    persist([...items, createEmptyItem(stepRef.current.id)])
  }

  const handleRemoveItem = (index: number) => {
    const removed = items[index]
    if (removed?.outgoingEdgeId) deleteEdge(removed.outgoingEdgeId)
    persist(items.filter((_, i) => i !== index))
  }

  const placeholderCacheRef = useRef<Map<string, string>>(new Map())
  const getPlaceholder = (itemId: string, index: number) => {
    const cached = placeholderCacheRef.current.get(itemId)
    if (cached) return cached
    const values = [
      'Ex: Ticket com status de “pendente”',
      'Ex: Ticket com status de “novo”',
      'Ex: Notificação admin',
    ]
    const value =
      index > 2 ? values[Math.floor(Math.random() * 3)] : values[index]
    placeholderCacheRef.current.set(itemId, value)
    return value
  }

  useEffect(() => {
    return () => {
      const filled = itemsRef.current.filter(
        (it) => (it.content ?? '').trim() !== ''
      )
      const empty = itemsRef.current.filter(
        (it) => (it.content ?? '').trim() === ''
      )
      empty.forEach((it) => {
        if (it.outgoingEdgeId) deleteEdgeRef.current(it.outgoingEdgeId)
      })

      if (filled.length < DEFAULT_ITEM_COUNT) {
        filled.forEach((it) => {
          if (it.outgoingEdgeId) deleteEdgeRef.current(it.outgoingEdgeId)
        })
        updateStepRef.current(indicesRef.current, { items: undefined })
        return
      }
      if (filled.length !== itemsRef.current.length) {
        updateStepRef.current(indicesRef.current, {
          items: filled,
        } as unknown as Partial<Step>)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={8}>
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Text>Saídas condicionais</Text>
          <Tooltip
            label={<Box dangerouslySetInnerHTML={{ __html: tooltipText }} />}
            hasArrow
          >
            <Box as="span" display="inline-flex" cursor="pointer">
              <Icon as={MdInfoOutline} boxSize={4} />
            </Box>
          </Tooltip>
        </HStack>
        <Switch
          colorScheme="blue"
          isChecked={isEnabled}
          onChange={handleToggle}
        />
      </HStack>

      {isEnabled && (
        <Stack spacing={3}>
          <Text fontWeight="bold" fontSize="sm">
            Opções de saídas
          </Text>
          {items.map((item, index) => {
            const isDefault = index < DEFAULT_ITEM_COUNT
            const label = isDefault ? `Saída ${index + 1}` : 'Nome'
            return (
              <HStack key={item.id}>
                <Box
                  flex={1}
                  bg="gray.50"
                  p={3}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="bold">
                      {label}
                    </Text>
                  </HStack>
                  <Input
                    bg="white"
                    size="md"
                    placeholder={getPlaceholder(item.id, index)}
                    value={item.content ?? ''}
                    onChange={(e) => handleUpdateItem(index, e.target.value)}
                  />
                </Box>
                {!isDefault && (
                  <IconButton
                    aria-label="Remover opção"
                    icon={<Icon as={MdClose} boxSize={5} />}
                    size="md"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                  />
                )}
              </HStack>
            )
          })}
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddItem}
            variant="outline"
            size="md"
            colorScheme="blue"
            width={200}
            alignSelf={'center'}
          >
            Adicionar opção
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

export default ConditionalEdges
