import { Box, Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { ChangeEvent, RefObject, useState } from 'react'
import { Step, WOZAssignStep } from 'models'

const DisableContextConfirmationBox = ({
  onStepChange,
  stepRef,
}: {
  onStepChange: (step: Partial<Step>) => void
  stepRef: RefObject<WOZAssignStep>
}) => {
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
      {isSeeMoreActive && (
        <Stack spacing={5} mt={3} pl={6} maxW="100%">
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="blueGray.400" mb={1.5}>
              Experiência menos inteligente e personalizada
            </Text>
            <Text fontSize="sm" color="blueGray.400" lineHeight="tall">
              O WOZ não confirmará o assunto, baseado no que for definido em{' '}
              <Text as="span" fontWeight="bold" color="blueGray.400">
                Redirecionamento baseado no assunto da conversa
              </Text>
              , antes de seguir para a próxima etapa, não garantindo que o
              contato esteja no caminho certo e tenha clareza sobre as opções
              disponíveis.
            </Text>
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="blueGray.400" mb={1.5}>
              Menos erros, mais assertividade
            </Text>
            <Text fontSize="sm" color="blueGray.400" lineHeight="tall">
              Essa confirmação evita que o contato siga para um fluxo incorreto
              sem querer, tornando a interação mais precisa e reduzindo
              retrabalho.
            </Text>
          </Box>
        </Stack>
      )}
    </Box>
  )
}

export default DisableContextConfirmationBox
