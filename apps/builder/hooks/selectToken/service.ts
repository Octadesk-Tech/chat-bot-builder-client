import { PaginatedData } from 'util/interfaces'
import type { Secret } from './types'
import { sendSecretsRequest } from 'util/secretsRequest'

export async function fetchSelectTokens(): Promise<PaginatedData<Secret>> {
  const data = await sendSecretsRequest({ url: '/', method: 'GET' })

  return data.data
}
