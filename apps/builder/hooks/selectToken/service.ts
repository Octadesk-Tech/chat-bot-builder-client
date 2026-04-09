import { PaginatedData } from 'util/interfaces'
import type { Secret } from './types'
import { sendSecretsRequest } from 'util/secretsRequest'

/** Simula o payload bruto da API (substituir por `fetch` real quando existir endpoint). */
const MOCK_API_ROWS = [
  {
    id: '1',
    name: 'token-1',
    description: 'Token 1',
    createdBy: 'user-1',
    createdAt: '2021-01-01',
  },
  {
    id: '2',
    name: 'token-2',
    description: 'Token 2',
    createdBy: 'user-2',
    createdAt: '2021-01-02',
  },
  {
    id: '3',
    name: 'user',
    description: 'User',
    createdBy: 'user-3',
    createdAt: '2021-01-03',
  },
  {
    id: '4',
    name: 'chave-slack',
    description: 'Chave Slack',
    createdBy: 'user-4',
    createdAt: '2021-01-04',
  },
] as const

const MOCK_PAGINATION = {
  page: 1,
  totalPages: 1,
  totalItems: 4,
  from: 1,
  to: 4,
}

export async function fetchSelectTokens(): Promise<PaginatedData<Secret>> {
  const data = await sendSecretsRequest({ url: '/', method: 'GET' })

  return data.data
}
