import { subDomain } from '@octadesk-tech/services';
import Storage from '@octadesk-tech/storage';
import { services } from '@octadesk-tech/services'

const getNucleusUrl = async () => {
  const authStorage = Storage.getItem('auth') as any

  const nucleusUrl = (window as any).NUCLEUS_API_URL

  const { data } = await services.nucleus
    .getClient({ baseURL: nucleusUrl })
    .get('/apiKeysManagement/apikeys-baseurl', {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authStorage?.access_token}`,
      },
    })

  return data;
}

export const mountUrl = async ({ blockId, botId }: IMountUrl) => {
  const baseUrl = await getNucleusUrl();
  const currentSubDomain = subDomain.getSubDomain()
  return `${baseUrl}/chat/external-webhook/${currentSubDomain}/${botId}/${blockId}/id-conversa`
}

type IMountUrl = {
  blockId: string;
  botId: string;
}
