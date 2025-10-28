import useSWR from 'swr'
import { useCallback, useMemo } from 'react'
import {
  Block,
  Variable,
  VariableForTest,
  VariableLight,
  Session,
  IntegrationStepType,
  Webhook,
} from 'models'
import { useTypebot } from 'contexts/TypebotContext'
import { fetchInterpretDataWithAI, testReturnService } from './service'

interface UseInterpretDataWithAIProps {
  step: any
}

export const useInterpretDataWithAI = ({
  step,
}: UseInterpretDataWithAIProps) => {
  const { typebot } = useTypebot()

  const edgesConnectedToMyBlock: string[] = useMemo(() => {
    const myEdges = typebot?.edges
      ?.filter((edge: any) => edge.to.blockId === step.blockId)
      ?.map((edge: any) => edge.from.blockId)

    return [...new Set(myEdges)]
  }, [typebot?.edges, step.blockId])

  const whoIsConnectedOnMyBlock: Block[] = useMemo(() => {
    const blocks = typebot?.blocks?.filter((b) =>
      edgesConnectedToMyBlock.includes(b.id)
    )
    return blocks || []
  }, [edgesConnectedToMyBlock, typebot?.blocks])

  const resolveSession = (
    variablesForTest: VariableForTest[],
    variables: Variable[]
  ): Session => {
    if (!variablesForTest?.length || !variables?.length)
      return { propertySpecs: [], properties: {} }

    const session: Session = { propertySpecs: [], properties: {} }

    variablesForTest.forEach((testVariable) => {
      const variable = variables.find(
        (v) => v.id === testVariable.variableId || v.id === testVariable.id
      )
      if (!variable) return

      const light: VariableLight = {
        domain: variable.domain,
        name: variable.name,
        token: variable.token,
        type: variable.type,
        value: testVariable.value,
      }

      session.propertySpecs.push(light)
      if (!session.properties[light.domain])
        session.properties[light.domain] = {}

      session.properties[light.domain][light.name] = {
        spec: light,
        value: testVariable.value,
      }
    })

    return session
  }

  const requestParams = useMemo(() => {
    if (!whoIsConnectedOnMyBlock?.length || !typebot) return null

    const block = whoIsConnectedOnMyBlock[0]

    if (whoIsConnectedOnMyBlock.length !== 1) return null

    if (block?.steps?.[0]?.type !== IntegrationStepType.WEBHOOK) return null

    const options = block?.steps?.[0]?.options
    if (!options) return null

    const parameters = options.parameters?.concat(options.headers) || []
    const localWebhook = {
      method: options.method,
      body: options.body,
      path: options.path,
      parameters,
      url: options.url,
    }

    const session = resolveSession(options.variablesForTest, typebot.variables)
    return { session, localWebhook }
  }, [whoIsConnectedOnMyBlock, typebot])

  const shouldFetch = !!requestParams
  const { data, isValidating, mutate } = useSWR(
    shouldFetch ? ['interpretDataWithAI', requestParams] : null,
    () =>
      fetchInterpretDataWithAI(
        requestParams!.session,
        requestParams!.localWebhook as unknown as Webhook
      ),
    {
      dedupingInterval: 1000 * 60 * 5, // 5 min
      revalidateOnFocus: false,
    }
  )

  const testReturn = useCallback(
    async (params: { systemMessage: string; data: string }) => {
      const result = await testReturnService({
        systemMessage: params.systemMessage,
        userMessage: params.data,
      })
      return result
    },
    [requestParams]
  )

  return {
    data,
    success: data?.success,
    isLoading: isValidating,
    whoIsConnectedOnMyBlock,
    testReturn,
    refetch: mutate,
  }
}
