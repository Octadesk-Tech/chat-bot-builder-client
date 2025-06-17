import { HttpMethodsWebhook, OctaProperty, QueryParameters, StepBase } from '.';

export type HelpDeskStep = CreateTicketStep

export enum TicketStepType {
  CREATE_TICKET = 'create_ticket'
}

export declare type CreateTicketStep = StepBase & {
  type: TicketStepType.CREATE_TICKET;
  options: CreateTicketOptions;
};

export type HelpDeskStepOptions = CreateTicketOptions

export type CreateTicketOptions = {
  type: TicketStepType.CREATE_TICKET;
  initialVariableToken?: string;
  variableId?: string;
  property?: OctaProperty;
  method: HttpMethodsWebhook;
  headers: QueryParameters[];
  parameters: QueryParameters[];
  path: string;
  url: string;
  body: string;
}
