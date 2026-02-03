import { headers } from '@octadesk-tech/services'
import getBaseClient from 'services/api/getBaseClient'

const sendMainBffRequest = async (request: {
  url: string
  method: string
  body?: unknown
}): Promise<any> => {
  const client = await getBaseClient('mainBff')
  const authorationHeaders = headers.getAuthorizedHeaders()

  if (request.method === 'PUT' || request.method === 'PATCH')
    return client.put(`/bots/${request.url}`, request.body, authorationHeaders)

  if (request.method === 'POST')
    return client.post(`/bots/${request.url}`, request.body, authorationHeaders)

  if (request.method === 'DELETE')
    return client.delete(`/bots/${request.url}`, authorationHeaders)
}

export { sendMainBffRequest }
