import {
  StepIndices,
  WhatsAppOptionsListStep,
  defaultWhatsAppOptionsListOptions,
  ItemType,
} from 'models'
import { useEffect, useMemo } from 'react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../../TextHtmlContent'
import { useTypebot } from 'contexts/TypebotContext'
import cuid from 'cuid'

type Props = {
  step: WhatsAppOptionsListStep
  indices: StepIndices
}

const WhatsAppOptionsContent = ({ step, indices }: Props) => {
  const { updateStep } = useTypebot()

  useEffect(() => {
    if (!step.options) step.options = defaultWhatsAppOptionsListOptions
  }, [step])

  const isDefaultState = useMemo(() => {
    const hasListItems = step.options?.listItems?.some((item: any) =>
      item.label?.trim()
    )
    const hasVariable = step.options?.variableId
    const isBodyDefault = !step.options?.body?.content?.plainText ||
      step.options.body.content.plainText === 'Pergunta com lista de opções'
    const isListTitleDefault = !step.options?.listTitle?.content?.plainText ||
      step.options.listTitle.content.plainText === 'Lista de opções'
    const hasCustomHeader = step.options?.header?.content?.plainText
    const hasCustomFooter = step.options?.footer?.content?.plainText

    return !hasListItems &&
      !hasVariable &&
      isBodyDefault &&
      isListTitleDefault &&
      !hasCustomHeader &&
      !hasCustomFooter
  }, [step.options])


  useEffect(() => {
    const listItems = step.options?.listItems
    if (!listItems?.length) return

    const hasRealContent = listItems.some((item: any) =>
      item.label && item.label.trim() !== ''
    )
    if (!hasRealContent) return

    const currentItems = step.items || []

    const needsUpdate =
      listItems.length !== currentItems.length ||
      listItems.some((listItem: any, idx: number) =>
        currentItems[idx]?.content !== listItem.label
      )

    if (!needsUpdate) return

    const updatedItems = listItems.map((listItem: any, index: number) => {
      const existingItem = currentItems.find((item: any) => item.id === listItem.id) || currentItems[index]

      return {
        id: existingItem?.id || listItem.id || cuid(),
        stepId: step.id,
        type: ItemType.WHATSAPP_OPTIONS_LIST,
        content: listItem.label,
        outgoingEdgeId: existingItem?.outgoingEdgeId,
      }
    })

    updateStep(indices, { items: updatedItems as any })
  }, [step.options?.listItems, step.items, step.id, indices, updateStep])


  if (isDefaultState) {
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
        html={step?.options?.header?.content?.html}
        color="#5A6377"
        fontWeight='bold'
        renderIfEmpty={false}
      />

      {/* Campo obrigatório body */}
      <TextHtmlContent html={step.options?.body?.content?.html} color="#5A6377" />
      <OctaDivider />
      {/* Campo obrigatório listTitle */}
      <TextHtmlContent html={step?.options?.listTitle?.content?.html} color="#5A6377" />

      <ItemNodesList step={step} indices={indices} />

      {step?.options?.footer?.content?.plainText && step?.options?.footer?.content?.plainText.trim() !== '' && (
        <>
          <OctaDivider />
          <TextHtmlContent
            html={step?.options?.footer?.content?.html}
            renderIfEmpty={false}
            fontSize={'xs'}
            color="#5A6377"
          />
        </>
      )}
      <OctaDivider />
      <WithVariableContent
        variableId={step?.options?.variableId}
        property={step?.options?.property}
      />
    </Stack>
  )
}

export default WhatsAppOptionsContent
