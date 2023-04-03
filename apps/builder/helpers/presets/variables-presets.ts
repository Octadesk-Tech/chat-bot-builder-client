import { DomainType } from "enums/customFieldsEnum"

export const fixedChatProperties = [
  {
    id: '7dbff220-3042-4cc1-9abb-8ff0a51616a4',
    key: 'id-conversa',
    token: '#id-conversa',
    fieldId: 'id-conversa',
    domain: 'CHAT',
    property: 'room.key',
    type: 'text',
    domainType: DomainType.Chat,
  },
  {
    id: 'eafcc7ab-c602-4929-93a6-32f25cf902b1',
    key: 'primeira-mensagem-cliente',
    token: '#primeira-mensagem-cliente',
    fieldId: 'primeira-mensagem-cliente',
    domain: 'CHAT',
    property: 'room.messages[0].comment',
    type: 'text',
    domainType: DomainType.Chat,
  },
  {
    id: 'a88c299f-0469-4da6-80aa-e7854c54289c',
    key: 'nome-empresa',
    token: '#nome-empresa',
    fieldId: 'nome-empresa',
    domain: 'CHAT',
    property: 'room.organization.name',
    type: 'text',
    domainType: DomainType.Chat,
  },
  {
    id: 'f4319ec7-abfc-46bc-97c4-d3d7aedca624',
    key: 'nome-agente',
    token: '#nome-agente',
    fieldId: 'nome-agente',
    domain: 'CHAT',
    property: 'room.agent.name',
    type: 'text',
    domainType: DomainType.Chat,
  },
]

export const fixedPersonProperties = [
  {
    id: '0a8c2f51-6a9d-4b4c-9343-fe2f15d1775c',
    token: '#nome-contato',
    example: 'José da Silva',
    domain: 'PERSON',
    type: 'string',
    name: 'name',
    domainType: DomainType.Person,
  },
  {
    id: '8750cb7e-d1a3-4c53-9c29-58e168c9408c',
    token: '#email-contato',
    example: 'email@cliente.com',
    domain: 'PERSON',
    type: 'email',
    name: 'email',
    domainType: DomainType.Person,
  },
  {
    id: '7cded475-befd-451c-957c-6806d2dda1e2',
    token: '#tel-celular-contato',
    example: '(11) 98765-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phone',
    domainType: DomainType.Person,
  },
  {
    id: '61e59026-dec8-46d7-bfb7-a2feccea6cb8',
    token: '#tel-comercial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.business',
    domainType: DomainType.Person,
  },
  {
    id: '069baaa6-323a-4539-8e7b-d9dca40e70e3',
    token: '#tel-residencial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.home',
    domainType: DomainType.Person,
  },
  {
    id: 'af8ecc51-8c4b-4827-9c43-d9a53531e535',
    token: '#status-do-contato',
    example: '',
    domain: 'PERSON',
    type: 'select',
    name: 'idContactStatus',
    dataSource: 'contactStatus',
    domainType: DomainType.Person,
  }
]

export const fixedOrganizationProperties = [
	{
    id: '963862f5-5783-4c32-92f1-255ee356508f',
		token: '#nome-organizacao',
		example: 'Organização',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'name',
	},
	{
    id: '72947e96-9bf3-4601-9930-73b005ad9f58',
		token: '#primeiro-telefone-organizacao',
		example: 'Telefone',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'firstPhoneContact',
	},
	{
    id: '6e6f608a-99eb-4f7d-9f26-e13eb4c8f0cf',
		token: '#primeiro-dominio-organizacao',
		example: 'Domínio',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'firstDomain',
	},
]

export const sessionChatProperties = []
