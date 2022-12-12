import { ItemBase, ItemType } from '.'
import { StepBase } from './steps'

export type InputStep =
  | TextInputStep
  | NumberInputStep
  | EmailInputStep
  | CpfInputStep
  | UrlInputStep
  | DateInputStep
  | PhoneNumberInputStep
  | ChoiceInputStep
  | PaymentInputStep
  | AskNameInputStep

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
  EMAIL = 'email input',
  CPF = 'cpf input',
  URL = 'url input',
  DATE = 'date input',
  PHONE = 'phone number input',
  CHOICE = 'choice input',
  PAYMENT = 'payment input',
  ASK_NAME = 'name input'
}

export type InputStepOptions =
  | TextInputOptions
  | NumberInputOptions
  | EmailInputOptions
  | DateInputOptions
  | UrlInputOptions
  | PhoneNumberInputOptions
  | ChoiceInputOptions
  | PaymentInputOptions
  | AskNameOptions

export type AskNameInputStep = StepBase & {
  type: InputStepType.ASK_NAME
  options: AskNameOptions
}

export type TextInputStep = StepBase & {
  type: InputStepType.TEXT
  options: TextInputOptions
}

export type NumberInputStep = StepBase & {
  type: InputStepType.NUMBER
  options: NumberInputOptions
}

export type EmailInputStep = StepBase & {
  type: InputStepType.EMAIL
  options: EmailInputOptions
}

export type CpfInputStep = StepBase & {
  type: InputStepType.CPF
  options: CpfInputOptions
}

export type UrlInputStep = StepBase & {
  type: InputStepType.URL
  options: UrlInputOptions
}

export type DateInputStep = StepBase & {
  type: InputStepType.DATE
  options: DateInputOptions
}

export type PhoneNumberInputStep = StepBase & {
  type: InputStepType.PHONE
  options: PhoneNumberInputOptions
}

export type ChoiceInputStep = StepBase & {
  type: InputStepType.CHOICE
  items: ButtonItem[]
  options: ChoiceInputOptions
}

export type ButtonItem = ItemBase & {
  type: ItemType.BUTTON
  content?: string
}

export type PaymentInputStep = StepBase & {
  type: InputStepType.PAYMENT
  options: PaymentInputOptions
}

export type CreditCardDetails = {
  number: string
  exp_month: string
  exp_year: string
  cvc: string
}

type OptionBase = { variableId?: string }

type InputTextOptionsBase = {
  labels: { placeholder: string; button: string }
}

export type ChoiceInputOptions = OptionBase & {
  isMultipleChoice: boolean
  buttonLabel: string
}

export type DateInputOptions = OptionBase & {
  labels: { button: string; from: string; to: string }
  hasTime: boolean
  isRange: boolean
}

export type EmailInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
}

export type CpfInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  variableId: string | undefined
  domain: string
  name: string
  token: string
  type: string | undefined
  example: string | undefined
  retryMessageContent: string
}

export type UrlInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
}

export type PhoneNumberInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
  defaultCountryCode?: string
}

export type TextInputOptions = OptionBase &
  InputTextOptionsBase & {
    isLong: boolean
  }

export type AskNameOptions = OptionBase &
  InputTextOptionsBase & {
    isLong: boolean
  }

export type NumberInputOptions = OptionBase &
  InputTextOptionsBase & {
    min?: number
    max?: number
    step?: number
  }

export enum PaymentProvider {
  STRIPE = 'Stripe',
}

export type PaymentInputOptions = OptionBase & {
  provider: PaymentProvider
  amount?: string
  currency: string
  credentialsId?: string
  additionalInformation?: {
    name?: string
    email?: string
    phoneNumber?: string
  }
  labels: { button: string }
}

const defaultButtonLabel = 'Enviar'

export const defaultTextInputOptions: TextInputOptions = {
  isLong: false,
  labels: { button: defaultButtonLabel, placeholder: 'Digite um texto...' },
}

export const defaultAskNameOptions: AskNameOptions = {
  isLong: false,
  variableId: '1',
  labels: { button: defaultButtonLabel, placeholder: 'Digite a sua resposta...' },
}

export const defaultNumberInputOptions: NumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: 'Digite o número...' },
}

export const defaultEmailInputOptions: EmailInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Digite o seu email...',
  },
  retryMessageContent:
    "Esse email não parece ser válido. Você pode digitar novamente?",
}

export const defaultCpfInputOptions: CpfInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Digite o seu cpf...',
  },
  variableId: undefined,
  example: undefined,
  domain: '',
  name: '',
  token: '',
  type: '',
  retryMessageContent:
    "Esse cpf não parece ser válido. Você pode digitar novamente?",
}

export const defaultUrlInputOptions: UrlInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Digite a URL...',
  },
  retryMessageContent:
    "Essa URL não parece válida. Você pode digitar novamente?",
}

export const defaultDateInputOptions: DateInputOptions = {
  hasTime: false,
  isRange: false,
  labels: { button: defaultButtonLabel, from: 'De:', to: 'Até:' },
}

export const defaultPhoneInputOptions: PhoneNumberInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Digite o seu número...',
  },
  retryMessageContent:
    "Esse número não parece válido. Você pode digitar novamente?",
}

export const defaultChoiceInputOptions: ChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  isMultipleChoice: false,
}

export const defaultPaymentInputOptions: PaymentInputOptions = {
  provider: PaymentProvider.STRIPE,
  labels: { button: 'Pay' },
  currency: 'USD',
}
