import { BubbleStepType, InputStepType, OctaWabaStepType } from 'models'

// Definição das constantes para as chaves usadas em expressões computadas
const EMAIL_FALLBACK_KEY = `${InputStepType.EMAIL} fallback`
const PHONE_FALLBACK_KEY = `${InputStepType.PHONE} fallback`
const WHATSAPP_OPTIONS_LIST_KEY = `${OctaWabaStepType.WHATSAPP_OPTIONS_LIST}`
const WHATSAPP_BUTTONS_LIST_KEY = `${OctaWabaStepType.WHATSAPP_BUTTONS_LIST}`
const WHATSAPP_OPTIONS_LIST_HEADER = `${WHATSAPP_OPTIONS_LIST_KEY} header`
const WHATSAPP_OPTIONS_LIST_BODY = `${WHATSAPP_OPTIONS_LIST_KEY} body`
const WHATSAPP_OPTIONS_LIST_FOOTER = `${WHATSAPP_OPTIONS_LIST_KEY} footer`
const WHATSAPP_OPTIONS_LIST_TITLE = `${WHATSAPP_OPTIONS_LIST_KEY} title`
const WHATSAPP_BUTTONS_LIST_HEADER = `${WHATSAPP_BUTTONS_LIST_KEY} header`
const WHATSAPP_BUTTONS_LIST_BODY = `${WHATSAPP_BUTTONS_LIST_KEY} body`
const WHATSAPP_BUTTONS_LIST_FOOTER = `${WHATSAPP_BUTTONS_LIST_KEY} footer`

// Atualização do tipo InputPlaceholders usando as constantes definidas
export type InputPlaceholders = {
  [InputStepType.ASK_NAME]: string
  [InputStepType.EMAIL]: string
  [EMAIL_FALLBACK_KEY]: string
  [InputStepType.CPF]: string
  [InputStepType.CHOICE]: string
  [InputStepType.PHONE]: string
  [PHONE_FALLBACK_KEY]: string
  [WHATSAPP_OPTIONS_LIST_HEADER]: string
  [WHATSAPP_OPTIONS_LIST_BODY]: string
  [WHATSAPP_OPTIONS_LIST_FOOTER]: string
  [WHATSAPP_OPTIONS_LIST_TITLE]: string
  [WHATSAPP_BUTTONS_LIST_HEADER]: string
  [WHATSAPP_BUTTONS_LIST_BODY]: string
  [WHATSAPP_BUTTONS_LIST_FOOTER]: string
  [OctaWabaStepType.COMMERCE]: string
  [BubbleStepType.MEDIA]: string
}
