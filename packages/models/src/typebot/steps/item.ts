import { ButtonItem, ConditionItem, ExternalEventItem, OfficeHoursItem, ReturnOfServiceItem, WebhookItem, WhatsAppButtonsItem, WhatsAppOptionsItem } from '.'

export type Item = ButtonItem | ConditionItem | OfficeHoursItem | WebhookItem | ExternalEventItem | WhatsAppOptionsItem | WhatsAppButtonsItem | ReturnOfServiceItem

export enum ItemType {
  BUTTON,
  CONDITION,
  OFFICE_HOURS,
  WEBHOOK,
  WHATSAPP_OPTIONS_LIST,
  WHATSAPP_BUTTONS_LIST,
  EXTERNAL_EVENT,
  RETURN_OF_SERVICE
}

export type ItemBase = {
  id: string
  stepId: string
  outgoingEdgeId?: string
}

export type ItemIndices = {
  blockIndex: number
  stepIndex: number
  itemIndex: number
  itemsCount?: number
}
