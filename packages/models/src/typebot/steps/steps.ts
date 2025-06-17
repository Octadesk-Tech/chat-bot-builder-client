import {
  InputStepOptions,
  IntegrationStepOptions,
  IntegrationStepType,
  Item,
  LogicStepOptions,
} from '.'
import { BubbleStep, BubbleStepType, WOZStepType } from './bubble'
import { HelpDeskStep, HelpDeskStepOptions, TicketStepType } from './helpDesk'
import { AskNameInputStep, InputOptions, InputStep, InputStepType } from './inputs'
import { IntegrationStep } from './integration'
import { ConditionStep, LogicStep, LogicStepType } from './logic'
import { ConversationTagStep, OctaBubbleStep, OctaBubbleStepType, OctaStep, OctaStepType, OctaWabaStep, OctaWabaStepType, WOZStep } from './octaStep'

export type Step =
  | StartStep
  | BubbleStep
  | InputStep
  | LogicStep
  | IntegrationStep
  | HelpDeskStep
  | OctaStep
  | OctaBubbleStep
  | AskNameInputStep
  | OctaWabaStep
  | WOZStep
  | ConversationTagStep

export type DraggableStep = BubbleStep | InputStep | LogicStep | IntegrationStep | HelpDeskStep | OctaStep | OctaBubbleStep | OctaWabaStep

export type StepType =
  | 'start'
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType
  | TicketStepType
  | OctaStepType // todos os tipos possíveis
  | OctaBubbleStepType // !!
  | OctaWabaStepType
  | WOZStepType

export type DraggableStepType =
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType
  | TicketStepType
  | OctaStepType
  | OctaBubbleStepType
  | OctaWabaStepType
  | WOZStepType

export type StepWithOptions =
  | InputStep
  | Exclude<LogicStep, ConditionStep>
  | IntegrationStep
  | HelpDeskStep

export type StepWithOptionsType =
  | InputStepType
  | Exclude<LogicStepType, LogicStepType.CONDITION>
  | Exclude<IntegrationStepType, IntegrationStepType.WEBHOOK>
  | Exclude<IntegrationStepType, IntegrationStepType.EXTERNAL_EVENT>
  | TicketStepType
  | IntegrationStepType

export type StepOptions =
  | InputStepOptions
  | LogicStepOptions
  | IntegrationStepOptions
  | HelpDeskStepOptions
  | InputOptions

export type StepWithItems = Omit<Step, 'items'> & { items: Item[] }

export type StepBase = { id: string; blockId: string; outgoingEdgeId?: string }

export type StartStep = StepBase & {
  type: 'start'
  label: string
}

export type StepIndices = {
  blockIndex: number
  stepIndex: number
}
