import { Coordinates } from 'contexts/GraphContext'
import cuid from 'cuid'
import { produce } from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import {
  Block,
  DraggableStep,
  DraggableStepType,
  IntegrationStepType,
  StepIndices,
  Typebot,
  WabaStepType,
} from 'models'
import { SetTypebot } from '../TypebotContext'
import { cleanUpEdgeDraft } from './edges'
import { createStepDraft, duplicateStepDraft } from './steps'

import {
  BubbleStepType,
  InputStepType,
  OctaBubbleStepType,
  OctaStepType,
} from 'models'

export type BlocksActions = {
  createBlock: (
    props: Coordinates & {
      id: string
      step: DraggableStep | DraggableStepType
      indices: StepIndices
    }
  ) => void
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) => void
  duplicateBlock: (blockIndex: number) => void
  deleteBlock: (blockIndex: number) => void
}

const blocksActions = (setTypebot: SetTypebot): BlocksActions => ({
  createBlock: ({
    id,
    step,
    indices,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    step: DraggableStep | DraggableStepType
    indices: StepIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newBlock: Block = {
          id,
          graphCoordinates,
          title: hisNameComponents(step),
          steps: [],
        }
        typebot.blocks.push(newBlock)
        createStepDraft(typebot, step, newBlock.id, indices)
      })
    ),
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.blocks[blockIndex]
        typebot.blocks[blockIndex] = { ...block, ...updates }
      })
    ),
  duplicateBlock: (blockIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.blocks[blockIndex]
        const id = cuid()
        const newBlock: Block = {
          ...block,
          title: `${block.title} copy`,
          id,
          steps: block.steps.map(duplicateStepDraft(id)),
          graphCoordinates: {
            x: block.graphCoordinates.x + 200,
            y: block.graphCoordinates.y + 100,
          },
        }
        typebot.blocks.splice(blockIndex + 1, 0, newBlock)
      })
    ),
  deleteBlock: (blockIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteBlockDraft(typebot)(blockIndex)
      })
    ),
})

const hisNameComponents = (step: DraggableStep | DraggableStepType) => {
  switch (step) {
    case BubbleStepType.TEXT:
      return 'Envie uma mensagem de texto'
    case BubbleStepType.IMAGE:
      return 'Envie um arquivo'
    case BubbleStepType.EMBED:
      return 'Envie um arquivo'
    case InputStepType.TEXT:
      return 'Pergunte qualquer coisa'
    case InputStepType.NUMBER:
      return 'Pergunte o número do pedido'
    case InputStepType.EMAIL:
      return 'Pergunte o email'
    case InputStepType.CPF:
      return 'Pergunte o CPF'
    case InputStepType.DATE:
      return 'Pergunte uma data'
    case InputStepType.PHONE:
      return 'Pergunte o número de celular'
    case InputStepType.CHOICE:
      return 'Botão??'
    case OctaStepType.ASSIGN_TO_TEAM:
      return 'Direcione a conversa para um agente/time'
    case OctaBubbleStepType.END_CONVERSATION:
      return 'Encerre a conversa do bot'
    case IntegrationStepType.WEBHOOK:
      return 'Conecte a outro sistema'
    case OctaStepType.OFFICE_HOURS:
        return 'Horário de atendimento'
    case WabaStepType.COMMERCE:
      return 'Commerce'
    case WabaStepType.BUTTONS:
      return 'Pergunta com botões interativos'
    case WabaStepType.OPTIONS:
      return 'Pergunta com lista de opções'
    default:
      return 'Outro'
  }
}

const deleteBlockDraft =
  (typebot: WritableDraft<Typebot>) => (blockIndex: number) => {
    cleanUpEdgeDraft(typebot, typebot.blocks[blockIndex].id)
    typebot.blocks.splice(blockIndex, 1)
  }

const removeEmptyBlocks = (typebot: WritableDraft<Typebot>) => {
  const emptyBlocksIndices = typebot.blocks.reduce<number[]>(
    (arr, block, idx) => {
      block.steps.length === 0 && arr.push(idx)
      return arr
    },
    []
  )
  emptyBlocksIndices.forEach(deleteBlockDraft(typebot))
}

export { blocksActions, removeEmptyBlocks }
