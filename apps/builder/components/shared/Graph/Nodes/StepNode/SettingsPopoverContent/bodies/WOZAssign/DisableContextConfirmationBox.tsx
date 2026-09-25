import { Box, Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { ChangeEvent, RefObject, useState } from 'react'
import { Step, WOZAssignStep } from 'models'
import { useWorkspace } from 'contexts/WorkspaceContext'
import CostReductionBadge from './CostReductionBadge'
import { Channels } from 'enums/channels'

const DisableContextConfirmationBox = ({
  onStepChange,
  stepRef,
}: {
  onStepChange: (step: Partial<Step>) => void
  stepRef: RefObject<WOZAssignStep>
}) => {
  const { workspace } = useWorkspace()
  const [isSeeMoreActive, setIsSeeMoreActive] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onStepChange({
      options: {
        ...stepRef.current?.options,
        disableContextConfirmation: e.target.checked,
      },
    } as Partial<Step>)
  }

  const seeMoreComponent = () => (
    <Text
      cursor="pointer"
      onClick={() => setIsSeeMoreActive(!isSeeMoreActive)}
      color="purple.400"
      fontSize={'sm'}
    >
      Ver {isSeeMoreActive ? 'menos' : 'mais'}
    </Text>
  )

  return (
    <Box>
      <HStack justify="space-between" alignItems="center" gap={2}>
        <HStack>
          <Checkbox
            colorScheme="blueGray"
            isChecked={stepRef?.current?.options?.disableContextConfirmation}
            onChange={handleChange}
          />
          <Text>Não confirmar redirecionamento</Text>
        </HStack>
        {seeMoreComponent()}
      </HStack>
      {workspace?.channel === Channels.WHATSAPP && (
        <Box mt={2}>
          <CostReductionBadge />
        </Box>
      )}
      {isSeeMoreActive && (
        <Stack spacing={5} mt={3} maxW="100%">
          <Text fontSize="sm" color="blueGray.400" lineHeight="tall">
            Quando ativado, o WOZ{' '}
            <Text as="span" fontWeight="bold">
              não confirmará o próximo passo
            </Text>
            , baseado no que for definido em{' '}
            <Text as="span" fontWeight="bold">
              Redirecionamento baseado no assunto da conversa
            </Text>
            . Apenas seguirá o caminho configurado de acordo com o contexto.
          </Text>
          <Text fontSize="sm" color="blueGray.400" lineHeight="tall">
            Quando desativado, o WOZ confirma a intenção e evita que o contato{' '}
            <Text as="span" fontWeight="bold">
              siga para um fluxo incorreto sem querer
            </Text>
            , tornando a interação mais precisa e reduzindo retrabalho.
          </Text>
        </Stack>
      )}
    </Box>
  )
}

export default DisableContextConfirmationBox
