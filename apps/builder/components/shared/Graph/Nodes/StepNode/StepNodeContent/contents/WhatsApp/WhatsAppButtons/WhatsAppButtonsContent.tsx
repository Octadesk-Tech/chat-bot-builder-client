import { Stack, Text } from '@chakra-ui/react'
import {
  StepIndices,
  WhatsAppButtonsListStep,
  defaultWhatsAppButtonsListOptions,
  ItemType,
} from 'models'
import { useEffect, useMemo } from 'react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WithVariableContent } from '../../WithVariableContent'
import { TextHtmlContent } from '../../TextHtmlContent'
import { useTypebot } from 'contexts/TypebotContext'
import cuid from 'cuid'

type Props = {
  step: WhatsAppButtonsListStep
  indices: StepIndices
}

const WhatsApButtonsContent = ({ step, indices }: Props) => {
  const { updateStep } = useTypebot()

  if (!step.options) step.options = defaultWhatsAppButtonsListOptions

  const isDefaultState = useMemo(() => {
    const hasButtons = Boolean(step.options?.buttonItems?.some((item: any) =>
      item.text?.trim()
    ))
    const hasVariable = Boolean(step.options?.variableId?.trim()) || Boolean((step as any)?.initialVariableToken?.trim())
    const isBodyDefault = !step.options?.body?.content?.plainText ||
      step.options.body.content.plainText === 'Configurar...'
    const hasCustomHeader = Boolean(step.options?.header?.content?.plainText)
    const hasCustomFooter = Boolean(step.options?.footer?.content?.plainText)

    return !hasButtons &&
      !hasVariable &&
      isBodyDefault &&
      !hasCustomHeader &&
      !hasCustomFooter
  }, [step.options])

  useEffect(() => {
    const buttonItems = step.options?.buttonItems
    const currentItems = step.items || []

    if (!buttonItems || buttonItems.length === 0) {
      return
    }

    const validButtonItems = buttonItems.filter((item: any) =>
      item.text && item.text.trim() !== ''
    )

    if (validButtonItems.length === 0) {
      if (currentItems.length > 0) {
        updateStep(indices, { items: [] as any })
      }
      return
    }

    const updatedItems = validButtonItems.map((buttonItem: any, index: number) => {
      const existingItem = currentItems.find((item: any) => item.id === buttonItem.id) || currentItems[index]

      return {
        id: existingItem?.id || buttonItem.id || cuid(),
        stepId: step.id,
        type: ItemType.WHATSAPP_BUTTONS_LIST,
        content: buttonItem.text,
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
  }, [step.options?.buttonItems, step.items, step.id, indices, updateStep])

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
      <TextHtmlContent
        html={step.options?.body?.content?.html}
        color="#5A6377"
        defaultPlaceholder="Configurar..."
      />

      {(step.options?.buttonItems?.some((item: any) => item.text?.trim()) ||
        (!step.options?.buttonItems?.length && step.items?.some((item: any) => item.content?.trim()))) && (
          <ItemNodesList step={step} indices={indices} />
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

      {(step?.options?.variableId?.trim() || (step as any)?.initialVariableToken?.trim() || step?.options?.property?.token?.trim()) && (
        <>
          <OctaDivider />
          <WithVariableContent
            variableId={step?.options?.variableId || (step as any)?.initialVariableToken}
            property={step?.options?.property}
          />
        </>
      )}
    </Stack>
  )
}

export default WhatsApButtonsContent
