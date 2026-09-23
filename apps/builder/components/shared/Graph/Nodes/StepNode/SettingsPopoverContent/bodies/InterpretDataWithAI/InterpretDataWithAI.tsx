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
  Divider,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react'
import {
  IntegrationStepType,
  Step,
  StepIndices,
  WOZInterpretDataWithAIOptions,
  WOZInterpretDataWithAIResponseFormat,
} from 'models'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import cuid from 'cuid'
import { useDebouncedCallback } from 'use-debounce'
import { isEmpty } from 'utils'
import { useInterpretDataWithAI } from 'hooks/InterpretDataWithAI/useInterpretDataWithAI'
import { VariablesMenu } from './VariablesMenu'
import { MdInfoOutline } from 'react-icons/md'
import { WOZInterpretDataWithAI } from 'models'
import { getDeepKeys } from 'services/integrations'
import { useTypebot, useTypebotActions, useTypebotVariables } from 'contexts/TypebotContext'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import ConditionalEdges from './ConditionalEdges/ConditionalEdges'

type Props = {
  step: WOZInterpretDataWithAI
  indices: StepIndices
  onStepChange: (updates: Partial<Step>) => void
  onContentChange: (content: WOZInterpretDataWithAIOptions) => void
}

const INSTRUCTIONS_DEBOUNCE_MS = 500
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type InstructionsTextareaProps = {
  initialValue: string
  placeholder: string
  responseKeys: string[]
  responseKeyMenuItems: { id: number; label: string }[]
  onChange: (value: string) => void
}

const InstructionsTextarea = ({
  initialValue,
  placeholder,
  responseKeys,
  responseKeyMenuItems,
  onChange,
}: InstructionsTextareaProps) => {
  const [value, setValue] = useState<string>(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const debouncedOnChange = useDebouncedCallback(
    onChange,
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? INSTRUCTIONS_DEBOUNCE_MS : 0
  )

  useEffect(() => () => debouncedOnChange.flush(), [debouncedOnChange])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleVariableSelected = (variable: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const currentCursorPos = textarea.selectionStart

    const beforeCursor = value.substring(0, currentCursorPos)
    const afterCursor = value.substring(currentCursorPos)

    const formattedVariable = `{{ ${variable} }}`
    const newValue = beforeCursor + formattedVariable + afterCursor
    const newCursorPosition = currentCursorPos + formattedVariable.length

    setValue(newValue)
    debouncedOnChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }

  return (
    <Box w="full">
      <Box position="relative" w="full">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          resize="none"
          maxLength={5000}
          minLength={1}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => debouncedOnChange.flush()}
          rows={10}
          paddingRight="45px"
          className="scrollbar-custom flex-1"
        />

        {responseKeys.length > 0 && (
          <Box position="absolute" bottom="14px" right="14px" zIndex={1}>
            <VariablesMenu
              size="sm"
              items={responseKeyMenuItems}
              getLabel={(item) => item.label}
              onSelect={(item) => handleVariableSelected(item.label)}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export const InterpretDataWithAI = ({
  step,
  indices,
  onStepChange,
  onContentChange,
}: Props) => {
  const {
    data,
    success,
    isLoading,
    whoIsConnectedOnMyBlock,
    isNonGetMethod,
    testReturn,
    refetch,
  } = useInterpretDataWithAI({ step })

  const { typebot } = useTypebot()
  const { createVariable, updateVariable, deleteVariable } = useTypebotActions()
  const variables = useTypebotVariables()
  const isAutomatedTasksBot = typebot?.availableFor.includes('automated-tasks')
  const [isTesting, setIsTesting] = useState(false)
  const [outputVariableName, setOutputVariableName] = useState(
    step?.content?.outputVariableName ?? ''
  )

  const isOutputVariableNameInvalid =
    outputVariableName.length > 0 && !SLUG_REGEX.test(outputVariableName)

  const isOutputVariableNameDuplicate = useMemo(() => {
    if (!outputVariableName || isOutputVariableNameInvalid) return false
    return (
      variables?.some(
        (v) => v.token === outputVariableName && v.fieldId !== step.id
      ) ?? false
    )
  }, [outputVariableName, isOutputVariableNameInvalid, variables, step.id])

  const syncOutputVariable = useCallback(
    (name: string) => {
      onContentChange({ ...step.content, outputVariableName: name })

      const existing = variables?.find((v) => v.fieldId === step.id)

      if (!name) {
        if (existing) deleteVariable(existing.id)
        return
      }

      if (existing) {
        updateVariable(existing.id, { name, token: name })
      } else {
        createVariable({
          id: cuid(),
          variableId: undefined,
          domain: 'CHAT',
          name,
          token: name,
          type: undefined,
          fieldId: step.id,
          example: undefined,
          fixed: false,
        })
      }
    },
    [step, variables, onContentChange, createVariable, updateVariable, deleteVariable]
  )

  const debouncedOutputVariableNameChange = useDebouncedCallback(
    syncOutputVariable,
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? INSTRUCTIONS_DEBOUNCE_MS : 0
  )

  const handleOutputVariableNameChange = (value: string) => {
    setOutputVariableName(value)
    const isFormatValid = !value || SLUG_REGEX.test(value)
    const isDuplicate = value
      ? (variables?.some((v) => v.token === value && v.fieldId !== step.id) ?? false)
      : false
    if (isFormatValid && !isDuplicate) debouncedOutputVariableNameChange(value)
  }

  const [resultOfInterpretWithAi, setResultOfInterpretWithAi] =
    useState<string>('')

  const toastError = useToast({
    position: 'top-right',
    status: 'error',
  })

  const stepDescription = useMemo(() => {
    if (isAutomatedTasksBot) {
      return 'Defina como a IA deve apresentar os dados coletados na conversa.'
    }
    return 'Defina como a IA deve apresentar os dados coletados para o próximo passo do fluxo.'
  }, [])

  const placeholderInstructions = useMemo(() => {
    return `Ex: Retorne ao cliente a lista dos tickets encontrados. 
  \b\b  
Use as variáveis: {{ numero-ticket }}, {{ status-ticket }}, 
{{ criado-em }}`
  }, [])

  const placeholderInstructionsEvents = useMemo(() => {
    if (
      step?.content?.responseFormat ===
      WOZInterpretDataWithAIResponseFormat.JSON
    ) {
      return `Ex: Crie um JSON com os dados do ticket. Use as variáveis: {ticked_id}, {assunto}, {responsavel}, {data_de_criacao}`
    }
    return `Ex: Gere um resumo das informações coletadas, listando o motivo do contato, o status atual e a data de abertura.`
  }, [step?.content?.responseFormat])

  const tooltipInstructions = useMemo(() => {
    return `Como instruir a IA?
<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;">
<li style="margin-bottom: 4px;">Digite quais dados você quer que apareça na resposta da conversa.</li>
<li style="margin-bottom: 4px;">Use o botão (+) para inserir as informações (variáveis) capturadas no passo anterior.</li>
<li style="margin-bottom: 4px;">Clique em 'Testar retorno' para ver um exemplo do que irá para a IA se basear e usar na conversa.</li>
<li style="margin-bottom: 4px;">Se usar <b>Saídas Condicionais:</b> Instrua a IA a analisar os dados e decidir qual o nome da saída correta (ex: "Se o status for 'novo', seguir saída 2”).</li>
</ol>`
  }, [])

  const tooltipInstructionsEvents = useMemo(() => {
    return `Como instruir a IA?
<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;">
<li style="margin-bottom: 4px;">Defina a estrutura de dados (ex: um JSON) que o próximo passo do fluxo deve receber.</li>
<li style="margin-bottom: 4px;">Use chaves {nome_da_variavel} para inserir dados de passos anteriores.</li>
<li style="margin-bottom: 4px;">Se usar <b>Saídas Condicionais:</b> Instrua a IA a analisar os dados e decidir qual o nome da saída correta (ex: "Se o status for 'novo', seguir saída 2”).</li>
</ol>`
  }, [])

  const tooltipInstructionsResponseFormat = useMemo(() => {
    return `<strong>Mensagem natural (texto):</strong>
    <br />
    Quando a informação for usada como um texto simples ou resumo em etapas posteriores do fluxo.
    <br />
    <br />
    <strong>JSON (estrutura):</strong>
    <br />
    Quando o próximo passo é uma integração/sistema externo e é preciso transformar informação em código para enviar para outro sistema.
    `
  }, [])

  const responseKeys = useMemo(
    () => getDeepKeys(data?.response || {}),
    [data?.response]
  )

  const responseKeyMenuItems = useMemo(
    () =>
      responseKeys.map((key, index) => ({
        id: index,
        label: key,
      })),
    [responseKeys]
  )

  const handleTestReturn = async () => {
    setIsTesting(true)
    try {
      const result = await testReturn({
        systemMessage: step?.content?.systemMessage || '',
        data: JSON.stringify(data?.response) || '',
      })

      const normalizedResult =
        typeof result === 'string' ? result : JSON.stringify(result)

      setResultOfInterpretWithAi(normalizedResult || '')
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

  const handleSelectResponseFormat = (
    value: WOZInterpretDataWithAIResponseFormat
  ) => {
    onContentChange({
      ...step.content,
      responseFormat: value,
    })
  }

  const responseFormatOptions = useMemo(() => {
    return [
      {
        key: 'json',
        label: 'JSON',
        value: WOZInterpretDataWithAIResponseFormat.JSON,
      },
      {
        key: 'text',
        label: 'Mensagem natural',
        value: WOZInterpretDataWithAIResponseFormat.TEXT,
      },
    ]
  }, [])

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

    if (!success && isAutomatedTasksBot && !isNonGetMethod) {
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
      <Stack direction="column" gap={4}>
        <Text>{stepDescription}</Text>
        {!isAutomatedTasksBot && (
          <Stack direction="row" justifyContent="space-between" w="full">
            <Stack direction="row" alignItems="center" gap={2}>
              <Text fontWeight="bold">Formato de saída</Text>
              <Tooltip
                label={
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: tooltipInstructionsResponseFormat,
                    }}
                  />
                }
                hasArrow
              >
                <Box as="span" display="inline-flex" cursor="pointer">
                  <Icon as={MdInfoOutline} boxSize={4} />
                </Box>
              </Tooltip>
            </Stack>
          </Stack>
        )}
        {!isAutomatedTasksBot && (
          <OctaSelect
            defaultSelected={
              step?.content?.responseFormat ||
              WOZInterpretDataWithAIResponseFormat.TEXT
            }
            onChange={handleSelectResponseFormat}
            placeholder="selecione uma opção"
            options={responseFormatOptions}
            findable
          />
        )}
        {!isAutomatedTasksBot && (
          <FormControl isInvalid={isOutputVariableNameInvalid || isOutputVariableNameDuplicate}>
            <FormLabel fontWeight="bold">Nome da variável de saída</FormLabel>
            <Input
              placeholder="ex: variavel-teste"
              value={outputVariableName}
              onChange={(e) => handleOutputVariableNameChange(e.target.value)}
              onBlur={() => debouncedOutputVariableNameChange.flush()}
            />
            {isOutputVariableNameInvalid && (
              <FormErrorMessage>
                Use apenas letras minúsculas, números e hífens (ex: variavel-teste)
              </FormErrorMessage>
            )}
            {!isOutputVariableNameInvalid && isOutputVariableNameDuplicate && (
              <FormErrorMessage>
                Este nome já está em uso por outra variável do fluxo
              </FormErrorMessage>
            )}
          </FormControl>
        )}
        <Stack direction="row" justifyContent="space-between" w="full">
          <Stack direction="row" alignItems="center" gap={2}>
            <Text fontWeight="bold">Instrução de formatação</Text>
            <Tooltip
              label={
                <Box
                  dangerouslySetInnerHTML={{
                    __html: isAutomatedTasksBot
                      ? tooltipInstructions
                      : tooltipInstructionsEvents,
                  }}
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
          <InstructionsTextarea
            initialValue={step?.content?.systemMessage || ''}
            placeholder={
              isAutomatedTasksBot
                ? placeholderInstructions
                : placeholderInstructionsEvents
            }
            responseKeys={responseKeys}
            responseKeyMenuItems={responseKeyMenuItems}
            onChange={(value) =>
              onContentChange({ ...step.content, systemMessage: value })
            }
          />
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
        <Divider />
        <ConditionalEdges
          step={step}
          indices={indices}
          onStepChange={onStepChange}
        />
      </Stack>
    )
  }, [
    data,
    success,
    isLoading,
    whoIsConnectedOnMyBlock,
    isNonGetMethod,
    isTesting,
    step,
    outputVariableName,
    isOutputVariableNameInvalid,
    isOutputVariableNameDuplicate,
  ])

  return (
    <Stack>
      <Stack>{componentToRender}</Stack>
    </Stack>
  )
}
