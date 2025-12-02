import { sendOctaRequest } from 'util/octaRequest'
import { Session, Webhook } from 'models'
import { headers } from '@octadesk-tech/services'
import getBaseClient from 'services/api/getBaseClient'

const fetchInterpretDataWithAI = async (
  session: Session,
  localWebhook: Webhook
) => {
  const { data } = await sendOctaRequest({
    url: `validate/webhook`,
    method: 'POST',
    body: {
      session,
      webhook: localWebhook,
    },
  })
  return data
}

const testReturnService = async (body: {
  systemMessage: string
  userMessage: string
}) => {
  const client = await getBaseClient('ai')
  const { data } = await client.post(`/suggestions/prompt/execute`, body, {
    headers: {
      ...headers.getAuthorizedHeaders().headers,
    },
  })
  return data
}

export { fetchInterpretDataWithAI, testReturnService }
