import {
  BubbleStepType,
  InputStepType,
  LogicStepType,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
  Step,
  IntegrationStepType,
  Edge,
} from 'models'
import { isBubbleStepType, isInputStep, stepHasItems } from 'utils'
import { z } from 'zod'

export enum VALIDATION_MESSAGE_TYPE {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export type ValidationMessage = {
  type: VALIDATION_MESSAGE_TYPE
  message: Array<string>
}

const runStringValidation = ({ max, min }: any) => {
  return z.object({
    message: z
      .string()
      .trim()
      .min(
        min?.value || 1,
        min?.message || 'Preencha todos os campos obrigatórios'
      )
      .max(max?.value || 500, max?.message || 'Máximo de 500 caracteres'),
  })
}

const hasConditionSameTargetBlock = (step: Step, edges: Edge[]): boolean => {
  if (step.type !== LogicStepType.CONDITION) return false
  if (!stepHasItems(step)) return false

  const validItems = step.items.filter((item) => item != null)
  if (validItems.length === 0) return false

  const itemEdge = edges.find(
    (e) => e.from.stepId === step.id && e.from.itemId && validItems.some((item) => item.id === e.from.itemId)
  )

  const stepEdge = edges.find(
    (e) => e.from.stepId === step.id && !e.from.itemId
  )

  if (itemEdge && stepEdge) {
    return itemEdge.to.blockId === stepEdge.to.blockId
  }

  return false
}

const inpuStepsWithFallbackMessages = [
  InputStepType.EMAIL,
  InputStepType.PHONE,
  OctaWabaStepType.WHATSAPP_OPTIONS_LIST,
  OctaWabaStepType.WHATSAPP_BUTTONS_LIST,
  InputStepType.CHOICE,
  IntegrationStepType.EXTERNAL_EVENT,
]

export const getValidationMessages = (step: Step, edges?: Edge[]): Array<ValidationMessage> => {
  try {
    const data = []

    if (edges && hasConditionSameTargetBlock(step, edges)) {
      return [
        {
          type: VALIDATION_MESSAGE_TYPE.WARNING,
          message: ['A etapa de sucesso e erro não pode apontar para a mesma etapa'],
        },
      ]
    }
    if (isInputStep(step) || OctaWabaStepType.COMMERCE === step.type) {
      data.push({
        message: step?.options?.message?.plainText,
      })

      if (step.type === InputStepType.CHOICE) {
        step?.items?.forEach((item) => {
          data.push({
            message: item?.content,
          })
        })
      }
    }
    if (isBubbleStepType(step.type)) {
      if (BubbleStepType.MEDIA === step.type) {
        data.push({
          message: step?.content?.message?.plainText,
          min: { value: -1 },
        })
      } else {
        data.push({
          message: step?.content?.plainText,
        })
      }
    }

    if (OctaStepType.CONVERSATION_TAG === step.type) {
      if (
        !step?.options?.tags ||
        step?.options?.tags.length === 0 ||
        step?.options?.tags[0]?._id === ''
      ) {
        data.push({
          message: undefined,
          min: { value: 1 },
        })
      }
    }

    if (OctaStepType.OFFICE_HOURS === step.type) {
      data.push({
        message: step?.options?.id,
      })
    }

    if (
      OctaWabaStepType.WHATSAPP_OPTIONS_LIST === step.type ||
      OctaWabaStepType.WHATSAPP_BUTTONS_LIST === step.type
    ) {
      data.push({
        message: step?.options?.body?.content?.plainText,
        max: { value: 1024 },
      })

      if (OctaWabaStepType.WHATSAPP_OPTIONS_LIST === step.type) {
        data.push({
          message: step?.options?.listTitle?.content?.plainText,
        })
      }
    }

    if (OctaStepType.ASSIGN_TO_TEAM === step.type) {
      data.push(
        {
          message: step?.options?.messages?.firstMessage?.content?.plainText,
          min: { value: -1 },
        },
        {
          message:
            step?.options?.messages?.noAgentAvailable?.content?.plainText,
          min: { value: -1 },
        },
        {
          message:
            step?.options?.messages?.connectionSuccess?.content?.plainText,
          min: { value: -1 },
        }
      )
    }

    if (OctaBubbleStepType.END_CONVERSATION === step.type) {
      data.push({
        message: step?.content?.plainText,
        min: { value: -1 },
      })
    }

    if (LogicStepType.CONDITION === step.type) {
      step?.items?.forEach((item) => {
        if (item?.content?.comparisons) {
          item.content.comparisons.forEach((comparison) => {
            data.push(
              {
                message: comparison?.comparisonOperator,
              },
              {
                message: comparison?.variableId,
              }
            )
          })
        }
      })
    }

    if (LogicStepType.CHAT_RETURN === step.type) {
      if (!step.options?.time || step.options?.validationError) {
        data.push({ message: undefined })
      }
    }

    if (inpuStepsWithFallbackMessages.includes(step.type)) {
      step?.options?.fallbackMessages?.forEach((fallbackMessage) => {
        data.push({
          message: fallbackMessage?.plainText,
        })
      })
    }

    if (step.type === IntegrationStepType.WEBHOOK) {
      data.push({
        message: step?.options?.url || '',
      })
    }
    data.map((d) => {
      return runStringValidation({ min: d?.min, max: d?.max }).parse({
        message: d.message || '',
      })
    })
    return []
  } catch (err) {
    const validationError = JSON.parse(err.message)[0]
    return [
      {
        type: VALIDATION_MESSAGE_TYPE.WARNING,
        message: [validationError.message],
      },
    ]
  }
}
