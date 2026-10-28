import { BubbleStep, BubbleStepType, ChoiceInputStep, ConditionStep, ExternalEventStep, ImageBubbleStep, InputStep, InputStepType, IntegrationStep, IntegrationStepType, LogicStep, LogicStepType, MediaBubbleStep, OctaBubbleStepType, OctaStepType, OctaWabaStepType, OfficeHourStep, ChatReturnStep, Step, StepType, StepWithOptionsType, TextBubbleStep, VideoBubbleStep, WebhookStep, WhatsAppButtonsListStep, WhatsAppOptionsListStep, WOZAssignStep, WOZStepType } from 'models';
export declare const sendRequest: <ResponseData>(params: {
    url: string;
    method: string;
    body?: Record<string, unknown>;
} | string) => Promise<{
    data?: ResponseData | undefined;
    error?: Error | undefined;
}>;
export declare const isDefined: <T>(value: T | null | undefined) => value is NonNullable<T>;
export declare const isNotDefined: <T>(value: T | null | undefined) => value is null | undefined;
export declare const isEmpty: (value: string | undefined | null) => value is undefined;
export declare const isNotEmpty: (value: string | undefined | null) => value is string;
export declare const isInputStep: (step: Step) => step is InputStep;
export declare const isBubbleStep: (step: Step) => step is BubbleStep;
export declare const isOctaBubbleStep: (step: Step) => step is import("models").EndConversationStep;
export declare const isLogicStep: (step: Step) => step is LogicStep;
export declare const isTextBubbleStep: (step: Step) => step is TextBubbleStep;
export declare const isMediaBubbleStep: (step: Step) => step is ImageBubbleStep | MediaBubbleStep | VideoBubbleStep;
export declare const isChoiceInput: (step: Step) => step is ChoiceInputStep;
export declare const isSingleChoiceInput: (step: Step) => step is ChoiceInputStep;
export declare const isConditionStep: (step: Step) => step is ConditionStep;
export declare const isIntegrationStep: (step: Step) => step is IntegrationStep;
export declare const isWebhookStep: (step: Step) => step is WebhookStep;
export declare const isBubbleStepType: (type: StepType) => type is BubbleStepType;
export declare const isOctaBubbleStepType: (type: StepType) => type is OctaBubbleStepType;
export declare const isOctaStepType: (type: StepType) => type is OctaStepType;
export declare const isWOZStepType: (type: StepType) => type is WOZStepType;
export declare const stepTypeHasOption: (type: StepType) => type is StepWithOptionsType;
export declare const OctaStepTypeHasOption: (type: OctaStepType) => type is OctaStepType;
export declare const stepTypeHasWebhook: (type: StepType) => type is IntegrationStepType.WEBHOOK;
export declare const stepTypeHasItems: (type: StepType | any) => type is InputStepType.CHOICE | LogicStepType.CONDITION | LogicStepType.CHAT_RETURN | IntegrationStepType | OctaStepType.OFFICE_HOURS | OctaWabaStepType.WHATSAPP_OPTIONS_LIST | OctaWabaStepType.WHATSAPP_BUTTONS_LIST | OctaWabaStepType.COMMERCE | WOZStepType.ASSIGN;
export declare const stepHasItems: (step: Step) => step is ChoiceInputStep | ConditionStep | ChatReturnStep | WebhookStep | ExternalEventStep | OfficeHourStep | WhatsAppOptionsListStep | WhatsAppButtonsListStep | WOZAssignStep;
export declare const byId: (id?: string) => (obj: {
    id: string;
}) => boolean;
export declare const byIdOrToken: (comparison?: string) => (obj: {
    id: string;
    token: string;
}) => boolean;
export declare const capitalize: (s: string) => string;
interface Omit {
    <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
        [K2 in Exclude<keyof T, K[number]>]: T[K2];
    };
}
export declare const omit: Omit;
export declare const sanitizeUrl: (url: string) => string;
export declare const validateUrl: (url: string) => boolean;
export {};
