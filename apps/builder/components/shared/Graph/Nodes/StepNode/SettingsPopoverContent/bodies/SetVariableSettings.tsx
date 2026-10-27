import {
  Alert,
  AlertIcon,
  FormLabel,
  HStack,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { Textarea } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { detectSuspiciousLoops, validateCode } from 'helpers/codeValidation'
import { SetVariableOptions, Variable } from 'models'
import React, { useMemo } from 'react'

type Props = {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      variableId: variable?.id,
      property: variable
        ? {
            domain: variable.domain,
            name: variable.name,
            token: variable.token,
            type: variable.type ?? 'string',
          }
        : undefined,
    })
  const handleExpressionChange = (expressionToEvaluate: string) =>
    onOptionsChange({ ...options, expressionToEvaluate })
  const handleValueTypeChange = () =>
    onOptionsChange({
      ...options,
      isCode: options.isCode ? !options.isCode : true,
    })

  const codeIssues = useMemo(() => {
    if (!options.isCode || !options.expressionToEvaluate) return undefined

    return {
      validation: validateCode(options.expressionToEvaluate),
      loops: detectSuspiciousLoops(options.expressionToEvaluate),
    }
  }, [options.isCode, options.expressionToEvaluate])

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Pesquise ou crie a variável de destino:
        </FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          initialVariableId={options.variableId}
          id="variable-search"
        />
      </Stack>
      <Stack>
        <HStack justify="space-between">
          <FormLabel mb="0" htmlFor="expression">
            Valor:
          </FormLabel>
          <HStack>
            <Text fontSize="sm">Texto</Text>
            <Switch
              size="sm"
              isChecked={options.isCode ?? false}
              onChange={handleValueTypeChange}
            />
            <Text fontSize="sm">Código</Text>
          </HStack>
        </HStack>

        {options.isCode ?? false ? (
          <>
            <Text fontSize="xs" color="gray.500">
              Escreva JavaScript. Leia as variáveis da conversa com{' '}
              <code>variables[&apos;nome&apos;]</code> e finalize com{' '}
              <code>return</code> — o valor retornado é salvo na variável.
            </Text>
            <CodeEditor
              value={options.expressionToEvaluate ?? ''}
              onChange={handleExpressionChange}
              lang="js"
            />
            {codeIssues && !codeIssues.validation.valid && (
              <Alert status="error" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Padrões não permitidos: {codeIssues.validation.violations.join(', ')}
              </Alert>
            )}
            {codeIssues && codeIssues.loops.length > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Possível loop infinito ({codeIssues.loops.join(', ')}). A
                execução é interrompida após 3 segundos.
              </Alert>
            )}
          </>
        ) : (
          <Textarea
            id="expression"
            defaultValue={options.expressionToEvaluate ?? ''}
            onChange={handleExpressionChange}
          />
        )}
      </Stack>
    </Stack>
  )
}
