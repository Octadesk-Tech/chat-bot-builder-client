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
    return `Retorne ao cliente um resumo dos incidentes encontrados. 
  \b\b  
Use as variáveis: {{incident_count}}, {{date_range}}, {{service_name}}, {{incident_date}}, 
{{incident_title}}, {{incident_status}}.  `
  }, [])

  const tooltipInstructions = useMemo(() => {
    return `Descreva o formato da mensagem que a IA deve gerar. Escreva o texto que desejar e clique nas {{variáveis}} disponíveis abaixo para incluir informações dinâmicas. <br /><br />
Clique em 'Testar retorno' para ver como ficará na prática.`
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
      if (block.steps[0].type !== IntegrationStepType.WEBHOOK)
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
            Este bloco deve receber apenas uma conexão, sendo esta conexão um
            componente chamado "Conecte a outro sistema"
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

    if (!success) {
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
          A IA interpreta a entrada e devolve como mensagem natural, para ser
          usado no próximo passo do fluxo.
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

            <Box position="absolute" bottom="14px" right="14px" zIndex={1}>
              <VariablesMenu
                variables={responseKeys || []}
                onVariableSelect={handleVariableSelected}
              />
            </Box>
          </Box>

          {resultOfInterpretWithAi.length > 0 && (
            <Box
              w="full"
              backgroundColor="purple.100"
              p={4}
              borderColor="purple.600"
              borderLeftWidth="3px"
            >
              <Text fontWeight="bold" fontSize="lg">
                Teste de retorno:
              </Text>
              <Text
                dangerouslySetInnerHTML={{ __html: resultOfInterpretWithAi }}
              />
            </Box>
          )}

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
