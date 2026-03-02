import {
  Stack,
  Text,
  Skeleton,
  Textarea,
  Tooltip,
  Icon,
  Box,
  VStack,
  Button,
  useToast,
  Spinner,
  HStack,
} from '@chakra-ui/react'
import { IntegrationStepType, WOZInterpretDataWithAIOptions } from 'models'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useInterpretDataWithAI } from 'hooks/InterpretDataWithAI/useInterpretDataWithAI'
import { VariablesMenu } from './VariablesMenu'
import { MdInfoOutline } from 'react-icons/md'
import { WOZInterpretDataWithAI } from 'models'
import { getDeepKeys } from 'services/integrations'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: WOZInterpretDataWithAI
  onContentChange: (content: WOZInterpretDataWithAIOptions) => void
}

export const InterpretDataWithAI = ({ step, onContentChange }: Props) => {
  const {
    data,
    success,
    isLoading,
    whoIsConnectedOnMyBlock,
    testReturn,
    refetch,
  } = useInterpretDataWithAI({ step })

  const { typebot } = useTypebot()
  const isAutomatedTasksBot = typebot?.availableFor.includes('automated-tasks')
  const [isTesting, setIsTesting] = useState(false)

  const [resultOfInterpretWithAi, setResultOfInterpretWithAi] =
    useState<string>('')

  const toastError = useToast({
    position: 'top-right',
    status: 'error',
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInstructionsChange = (value: string) => {
    onContentChange({
      ...step.content,
      systemMessage: value,
    })
  }

  const handleVariableSelected = (variable: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const currentValue = textarea.value
    const currentCursorPos = textarea.selectionStart

    const beforeCursor = currentValue.substring(0, currentCursorPos)
    const afterCursor = currentValue.substring(currentCursorPos)

    const formattedVariable = `{{ ${variable} }}`
    const newValue = beforeCursor + formattedVariable + afterCursor
    const newCursorPosition = currentCursorPos + formattedVariable.length

    onContentChange({
      ...step.content,
      systemMessage: newValue,
    })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }

  const placeholderInstructions = useMemo(() => {
    return `Ex: Retorne ao cliente a lista dos tickets encontrados. 
  \b\b  
Use as variáveis: {{ numero-ticket }}, {{ status-ticket }}, 
{{ criado-em }}`
  }, [])

  const tooltipInstructions = useMemo(() => {
    return `Como instruir a IA?
<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;">
<li style="margin-bottom: 4px;">Digite quais dados você quer que apareça na resposta da conversa.</li>
<li style="margin-bottom: 4px;">Use o botão (+) para inserir as informações (variáveis) capturadas no passo anterior.</li>
<li style="margin-bottom: 4px;">Clique em 'Testar retorno' para ver um exemplo do que irá para a IA se basear e usar na conversa.</li>
</ol>`
  }, [])

  const responseKeys = useMemo(
    () => getDeepKeys(data?.response || {}),
    [data?.response]
  )

  const handleTestReturn = async () => {
    setIsTesting(true)
    try {
      const result = await testReturn({
        systemMessage: step?.content?.systemMessage || '',
        data: JSON.stringify(data?.response) || '',
      })

      setResultOfInterpretWithAi(result)
    } catch (error) {
      toastError({
        title: 'Erro ao testar retorno',
        description:
          'Houve um erro ao testarmos sua requição. Tente novamente em alguns instantes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsTesting(false)
    }
  }

  const componentToRender = useMemo(() => {
    if (whoIsConnectedOnMyBlock?.length <= 0) {
      return (
        <Stack>
          <Text>Este componente precisa receber ao menos uma conexão</Text>
        </Stack>
      )
    }

    if (whoIsConnectedOnMyBlock?.length === 1) {
      const block = whoIsConnectedOnMyBlock[0]
      if (
        block.steps[0].type !== IntegrationStepType.WEBHOOK &&
        isAutomatedTasksBot
      )
        return (
          <Stack>
            <Text>
              Este bloco deve receber uma conexão de um componente chamado
              "Conecte a outro sistema"
            </Text>
          </Stack>
        )
    }

    if (whoIsConnectedOnMyBlock?.length > 1) {
      return (
        <Stack>
          <Text>
            Este bloco deve receber apenas uma conexão{' '}
            {isAutomatedTasksBot
              ? `, sendo esta conexão um
            componente chamado "Conecte a outro sistema"`
              : ''}
          </Text>
        </Stack>
      )
    }

    if (isLoading) {
      return (
        <Stack>
          <Skeleton height="20px" width="100%" />
          <Skeleton height="200px" width="100%" />
        </Stack>
      )
    }

    if (!success && isAutomatedTasksBot) {
      return (
        <Stack>
          <Text color="red">
            Houve um erro ao testarmos sua requição. Verifique os dados no bloco
            anterior e tente novamente.
          </Text>
          <Button w="full" colorScheme="blue" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Stack>
      )
    }

    return (
      <Stack>
        <Text>
          Defina como a IA deve apresentar os dados coletados na conversa.
        </Text>

        <Stack direction="row" justifyContent="space-between" w="full">
          <Stack direction="row" alignItems="center" gap={2}>
            <Text fontWeight="bold">Instruções de retorno</Text>
            <Tooltip
              label={
                <Box
                  dangerouslySetInnerHTML={{ __html: tooltipInstructions }}
                />
              }
              hasArrow
            >
              <Box as="span" display="inline-flex" cursor="pointer">
                <Icon as={MdInfoOutline} boxSize={4} />
              </Box>
            </Tooltip>
          </Stack>
          <Text>{step?.content?.systemMessage?.length || 0}/5000</Text>
        </Stack>

        <VStack gap={4} w="full">
          <Box>
            <Box position="relative" w="full">
              <Textarea
                ref={textareaRef}
                placeholder={placeholderInstructions}
                resize="none"
                maxLength={5000}
                minLength={1}
                value={step?.content?.systemMessage || ''}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                rows={10}
                paddingRight="45px"
                className="scrollbar-custom"
              />

              {responseKeys.length > 0 && (
                <Box position="absolute" bottom="14px" right="14px" zIndex={1}>
                  <VariablesMenu
                    variables={responseKeys || []}
                    onVariableSelect={handleVariableSelected}
                  />
                </Box>
              )}
            </Box>
            <Text mt={2} fontSize="xs" color="gray.500">
              A IA usará este texto como base. Não é necessário dar comandos de
              comportamento aqui, apenas estruturar a informação.
            </Text>
          </Box>

          {resultOfInterpretWithAi.length > 0 && (
            <Box
              w="full"
              backgroundColor="purple.100"
              p={4}
              borderColor="purple.600"
              borderLeftWidth="3px"
            >
              <Text fontWeight="bold" fontSize="md">
                Teste de retorno:
              </Text>
              <Text
                fontSize="sm"
                dangerouslySetInnerHTML={{ __html: resultOfInterpretWithAi }}
              />
            </Box>
          )}

          {isAutomatedTasksBot && (
            <Button
              disabled={isTesting || !step?.content?.systemMessage?.length}
              w="full"
              colorScheme="blue"
              onClick={handleTestReturn}
            >
              <HStack alignItems="center" gap={2}>
                {isTesting && <Spinner size="sm" />}
                <Text>
                  {isTesting ? 'Testando  retorno...' : 'Testar retorno'}
                </Text>
              </HStack>
            </Button>
          )}
        </VStack>
      </Stack>
    )
  }, [data, success, isLoading, whoIsConnectedOnMyBlock, isTesting])

  return (
    <Stack>
      <Stack>{componentToRender}</Stack>
    </Stack>
  )
}
