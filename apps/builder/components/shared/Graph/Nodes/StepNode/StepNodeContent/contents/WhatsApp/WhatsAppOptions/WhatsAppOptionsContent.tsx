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

  if (!step.options) step.options = defaultWhatsAppOptionsListOptions

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
    const currentItems = step.items || []

    if (!listItems || listItems.length === 0) {
      return
    }

    const validListItems = listItems.filter((item: any) =>
      item.label && item.label.trim() !== ''
    )

    if (validListItems.length === 0) {
      if (currentItems.length > 0) {
        updateStep(indices, { items: [] as any })
      }
      return
    }

    const updatedItems = validListItems.map((listItem: any, index: number) => {
      const existingItem = currentItems.find((item: any) => item.id === listItem.id) || currentItems[index]

      return {
        id: existingItem?.id || listItem.id || cuid(),
        stepId: step.id,
        type: ItemType.WHATSAPP_OPTIONS_LIST,
        content: listItem.label,
        outgoingEdgeId: existingItem?.outgoingEdgeId,
      }
    })

    const needsUpdate =
      updatedItems.length !== currentItems.length ||
      updatedItems.some((item: any, idx: number) =>
        currentItems[idx]?.content !== item.content
      )

    if (needsUpdate) {
      updateStep(indices, { items: updatedItems as any })
    }
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

      {(step.options?.listItems?.some((item: any) => item.label?.trim()) ||
        (!step.options?.listItems?.length && step.items?.some((item: any) => item.content?.trim()))) && (
          <ItemNodesList step={step} indices={indices} isReadOnly={true} />
        )}

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
      {(step?.options?.variableId?.trim() || step?.options?.property?.token?.trim()) && (
        <>
          <OctaDivider />
          <WithVariableContent
            variableId={step?.options?.variableId}
            property={step?.options?.property}
          />
        </>
      )}
    </Stack>
  )
}

export default WhatsAppOptionsContent
