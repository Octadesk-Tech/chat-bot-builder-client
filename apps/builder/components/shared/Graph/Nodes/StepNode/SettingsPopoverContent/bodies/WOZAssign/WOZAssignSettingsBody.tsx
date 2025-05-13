import { Divider, HStack, Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WOZAssignOptions } from 'models'
import { useState } from 'react'
import { WozAssignSelect } from './WozAssignSelect'
import WozQtdAttemptsSelect from './WozQtdAttemptsSelect'

type Props = {
  options: WOZAssignOptions
  onOptionsChange: (options: WOZAssignOptions) => void
}

export const WOZAssignSettingBody = ({ options, onOptionsChange }: Props) => {
  const [viewMoreInfo, setViewMoreInfo] = useState('')

  const changeViewMoreInfo = (infoToShow: string) => {
    setViewMoreInfo(infoToShow === viewMoreInfo ? '' : infoToShow)
  }

  const isRedirectionInfo = () => {
    return viewMoreInfo === 'redirection'
  }

  const handleWozAssignSelect = (e: any) => {
    onOptionsChange({
      ...options,
      virtualAgentId: e.profile,
    })
  }
  const handleChangeAttempts = (e: any) => {
    onOptionsChange({
      ...options,
      limitAnswerNoContent: e,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>Qual perfil deve ser chamado?</Text>
        <WozAssignSelect
          selectedProfile={options.virtualAgentId}
          onSelect={handleWozAssignSelect}
        />
      </Stack>
      <WozQtdAttemptsSelect
        selectedValue={options.limitAnswerNoContent}
        onChange={handleChangeAttempts}
      />
      <Stack>
        <OctaDivider width="100%" />
        <HStack justify="space-between">
          <Text>Redirecionamento baseado no assunto da conversa</Text>
          <Text
            cursor={'pointer'}
            onClick={() => changeViewMoreInfo('redirection')}
            fontSize={'13px'}
            align={'center'}
            color={'purple.400'}
          >
            <span>Ver {isRedirectionInfo() ? 'menos' : 'mais'}</span>
          </Text>
        </HStack>
        {isRedirectionInfo() && (
          <Stack justify="space-between" color="gray.400" fontSize="sm">
            <Text fontWeight="bold">
              Contextos que sempre estarão disponíveis:
            </Text>
            <Text>
              <Text as={'b'} fontWeight="bold">
                Falar com Humano:
              </Text>{' '}
              O WOZ reconhecerá quando o usuário quer conversar com uma pessoa e
              permite que você direcione a conversa para o time de atendimento
              sem atritos.
              <br />
              <Text as={'b'} fontWeight="bold">
                Encerrar a conversa:
              </Text>{' '}
              O WOZ identificará quando o cliente deseja finalizar a interação,
              e direciona a conversa para essa etapa.
            </Text>

            <Divider />

            <Text fontWeight="bold">
              Exemplos de outro contextos que podem ser utilizados:
            </Text>
            <Text>
              <Text as={'b'} fontWeight="bold">
                Informações sobre compra:
              </Text>{' '}
              O WOZ entenderá que o cliente quer mais informações sobre um
              pedido ou uma compra e segue o direcionamento da conversa conforme
              configurado no bot. Seja encaminhando para puxar informações de
              sistemas terceiros sobre o pedido ou seja encaminhando a conversa
              para o time responsável. 
              <br />
              <Text as={'b'} fontWeight="bold">
                Reclamações e insatisfações:
              </Text>{' '}
              WOZ perceberá se o cliente demonstrar frustração ou usar palavras
              negativas (ex.: "quero cancelar", "isso não resolve meu
              problema"), e pode escalar a conversa para um atendente específico
              ou oferecer soluções personalizadas.
            </Text>

            <Text
              as="a"
              href="https://help.octadesk.com/kb/article/como-configurar-o-woz-agente"
              target="_blank"
              rel="noreferrer"
              color="purple.400"
              align={'center'}
            >
              Saiba mais
            </Text>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
