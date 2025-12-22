import {
  Box,
  Button,
  Divider,
  Flex,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WOZAssignStep, Step, ItemType } from 'models'
import { useState, useRef, useEffect } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'
import { WozAssignSelect } from './WozAssignSelect'
import WozQtdAttemptsSelect from './WozQtdAttemptsSelect'
import cuid from 'cuid'

type Props = {
  step: WOZAssignStep
  onStepChange: (step: Partial<Step>) => void
}

const DEFAULT_OPTIONS = [
  { id: 'default-1', label: 'Encerrar a conversa', readonly: true },
  { id: 'default-2', label: 'Falar com um humano', readonly: true },
]

const MAX_LENGTH_OPTION_TEXT = 100

export const WOZAssignSettingBody = ({
  step,
  onStepChange,
}: Props) => {
  const [viewMoreInfo, setViewMoreInfo] = useState('')

  const stepRef = useRef(step)
  stepRef.current = step

  const options = step.options

  const getDefaultItems = () => {
    if (stepRef.current?.items && stepRef.current.items.length >= 2) {
      return stepRef.current.items.slice(0, 2)
    }
    return []
  }

  const getInitialItems = () => {
    if (step.items && step.items.length > 2) {
      return step.items.slice(2).map((item: any) => ({
        id: item.id,
        label: item.content || '',
        readonly: false,
      }))
    }
    if (step.options?.customContexts && step.options.customContexts.length > 0) {
      return [...step.options.customContexts]
    }
    return []
  }

  const [localListItems, setLocalListItems] = useState<any[]>(() => getInitialItems())
  const localListItemsRef = useRef(localListItems)
  localListItemsRef.current = localListItems

  useEffect(() => {
    return () => {
      const itemsWithContent = localListItemsRef.current.filter(
        (item) => item.label && item.label.trim() !== ''
      )

      const currentItems = stepRef.current?.items || []
      const defaultItems = currentItems.length >= 2
        ? currentItems.slice(0, 2)
        : [
          {
            id: 'default-1',
            stepId: stepRef.current?.id,
            type: ItemType.BUTTON,
            content: 'Encerrar a conversa',
            readonly: true,
            canAddItem: false,
          },
          {
            id: 'default-2',
            stepId: stepRef.current?.id,
            type: ItemType.BUTTON,
            content: 'Falar com um humano',
            readonly: true,
            canAddItem: false,
          },
        ]

      const newStepItems = [
        ...defaultItems,
        ...itemsWithContent.map((item) => ({
          id: item.id,
          stepId: stepRef.current?.id,
          type: ItemType.BUTTON,
          content: item.label,
          readonly: true,
          canAddItem: false,
        })),
      ]

      onStepChange({
        items: newStepItems,
        options: { ...stepRef.current?.options, customContexts: itemsWithContent }
      } as Partial<Step>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeViewMoreInfo = (infoToShow: string) => {
    setViewMoreInfo(infoToShow === viewMoreInfo ? '' : infoToShow)
  }

  const isRedirectionInfo = () => {
    return viewMoreInfo === 'redirection'
  }

  const handleWozAssignSelect = (e: any) => {
    onStepChange({
      options: { ...stepRef.current?.options, virtualAgentId: e.profile }
    } as Partial<Step>)
  }

  const handleChangeAttempts = (e: any) => {
    onStepChange({
      options: { ...stepRef.current?.options, limitAnswerNoContent: e }
    } as Partial<Step>)
  }

  const updateStepAndOptions = (customItems: any[]) => {
    const defaultItems = getDefaultItems()
    const filteredCustomItems = customItems.filter((item) => item.label && item.label.trim() !== '')

    const newItems = [
      ...defaultItems,
      ...filteredCustomItems.map((item) => ({
        id: item.id,
        stepId: stepRef.current?.id,
        type: ItemType.BUTTON,
        content: item.label,
        readonly: true,
        canAddItem: false,
      })),
    ]

    onStepChange({
      items: newItems,
      options: { ...stepRef.current?.options, customContexts: customItems }
    } as Partial<Step>)
  }

  const handleAddOption = () => {
    const newOption = {
      id: cuid(),
      label: '',
      readonly: false,
    }

    const updatedItems = [...localListItems, newOption]
    setLocalListItems(updatedItems)
    onStepChange({
      options: { ...stepRef.current?.options, customContexts: updatedItems }
    } as Partial<Step>)
  }

  const handleUpdateOption = (index: number, value: string) => {
    const updatedItems = [...localListItems]
    updatedItems[index] = {
      ...updatedItems[index],
      label: value,
    }

    setLocalListItems(updatedItems)
    updateStepAndOptions(updatedItems)
  }

  const handleRemoveOption = (index: number) => {
    const updatedItems = localListItems.filter((_: any, i: number) => i !== index)

    setLocalListItems(updatedItems)
    updateStepAndOptions(updatedItems)
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

      <Stack spacing={3}>
        <FormLabel mb="0" fontWeight="bold" fontSize={'sm'}>
          Opções de assunto de conversa
        </FormLabel>

        <Stack spacing={3}>
          {DEFAULT_OPTIONS.map((item) => (
            <Flex key={item.id} gap={2} alignItems="center">
              <Box
                bg="#F4F4F5"
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor="#E3E4E8"
                flex="1"
              >
                <Input
                  value={item.label}
                  isReadOnly
                  size="md"
                  bg="white"
                  color="gray.300"
                  cursor="not-allowed"
                  _focus={{ boxShadow: 'none' }}
                />
              </Box>
            </Flex>
          ))}

          {localListItems.map((item: any, index: number) => (
            <Flex key={item.id} gap={2} alignItems="center">
              <Box
                bg="#F4F4F5"
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor="#E3E4E8"
                flex="1"
              >
                <Input
                  placeholder="Insira o texto desta resposta..."
                  value={item.label}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  maxLength={MAX_LENGTH_OPTION_TEXT}
                  bg="white"
                  size="md"
                  focusBorderColor="none"
                />
              </Box>

              <IconButton
                aria-label="Remover opção"
                icon={<Icon as={MdClose} boxSize={5} />}
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveOption(index)}
                _hover={{ bg: 'transparent', color: 'red.500' }}
              />
            </Flex>
          ))}
        </Stack>

        <Flex justify="center">
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddOption}
            variant="outline"
            size="md"
            color="#1366C9"
            borderColor="#1366C9"
            borderWidth="2px"
            fontSize="sm"
            _hover={{ bg: '#1366C9', color: 'white' }}
          >
            Adicionar opção
          </Button>
        </Flex>
      </Stack>
    </Stack>
  )
}
