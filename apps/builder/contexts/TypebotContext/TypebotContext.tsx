import { useToast } from '@chakra-ui/react'
import {
  LogicStepType,
  PublicTypebot,
  Settings,
  Theme,
  Typebot,
  Webhook,
} from 'models'
import { Router, useRouter } from 'next/router'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  createPublishedTypebot,
  parsePublicTypebotToTypebot,
  parseTypebotToPublicTypebot,
  updatePublishedTypebot,
} from 'services/publicTypebot'
import {
  checkIfPublished,
  parseDefaultPublicId,
  updateTypebot,
} from 'services/typebots/typebots'
import { fetcher, preventUserFromRefreshing } from 'services/utils'
import useSWR from 'swr'
import { isDefined, isNotDefined } from 'utils'
import { BlocksActions, blocksActions } from './actions/blocks'
import { stepsAction, StepsActions } from './actions/steps'
import { variablesAction, VariablesActions } from './actions/variables'
import { edgesAction, EdgesActions } from './actions/edges'
import { useRegisterActions } from 'kbar'
import useUndo from 'services/utils/useUndo'
import { useDebounce } from 'use-debounce'
import { itemsAction, ItemsActions } from './actions/items'
import { saveWebhook } from 'services/webhook'
import { stringify } from 'qs'
import cuid from 'cuid'
import { subDomain } from '@octadesk-tech/services'
import { config } from 'config/octadesk.config'

import Agents from 'services/octadesk/agents/agents'
import Groups from 'services/octadesk/groups/groups'
import { BotsService } from 'services/octadesk/bots/bots'
import { ASSIGN_TO } from 'enums/assign-to'
import { updateBlocksHasConnections } from 'helpers/block-connections'
import { TagsService } from 'services/octadesk/tags/tags.service'
import useEmptyFields, {
  ActionsTypeEmptyFields,
  EmptyFields,
} from 'hooks/EmptyFields/useEmptyFields'
import useCustomVariables from 'hooks/CustomVariables/useCustomVariables'
import { ICustomVariable } from 'hooks/CustomVariables/interface'
import { WOZService } from 'services/octadesk/woz/woz.service'
import useWozProfiles from 'hooks/WozProfiles/useWozProfiles'

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
  publishedTypebotId: string
  icon: string
}>

type SaveResponse = {
  saved: boolean
  updatedAt: Date
}

export type SetTypebot = (
  newPresent: Typebot | ((current: Typebot) => Typebot),
  options?: { updateDate?: boolean; skipConnectionsUpdate?: boolean }
) => void
export type SetEmptyFields = (
  values: EmptyFields[] | string[],
  action: ActionsTypeEmptyFields
) => void
const typebotContext = createContext<
  {
    domain?: string | null
    typebot?: Typebot
    emptyFields: EmptyFields[]
    customVariables: ICustomVariable[]
    setEmptyFields: SetEmptyFields
    hideEdges: boolean
    setHideEdges: Dispatch<SetStateAction<boolean>>
    publishedTypebot?: PublicTypebot
    linkedTypebots?: Typebot[]
    isReadOnly?: boolean
    isPublished: boolean
    isPublishing: boolean
    isSavingLoading: boolean
    save: (
      personaName?: string,
      personaThumbUrl?: string
    ) => Promise<SaveResponse>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateWebhook: (
      webhookId: string,
      webhook: Partial<Webhook>
    ) => Promise<void>
    updateTypebot: (updates: UpdateTypebotPayload) => void
    updateOnBothTypebots: (updates: {
      publicId?: string
      name?: string
      customDomain?: string | null
    }) => void
    publishTypebot: () => void
    restorePublishedTypebot: () => void
    octaAgents: Array<any>
    octaGroups: Array<any>
    botFluxesList: Array<any>
    tagsList: Array<any>
    wozProfiles: Array<any>
    currentTypebot?: Typebot
  } & BlocksActions &
    StepsActions &
    ItemsActions &
    VariablesActions &
    EdgesActions
>({} as any)

/**
 * Context separado só para as ações de mutação (estáveis). Permite que
 * componentes que só precisam disparar mutações consumam `useTypebotActions()`
 * sem assinar os dados do typebot — evitando re-render a cada edição.
 * As mesmas ações continuam disponíveis em `useTypebot()` por compatibilidade.
 */
export type TypebotActions = BlocksActions &
  StepsActions &
  ItemsActions &
  VariablesActions &
  EdgesActions
const typebotActionsContext = createContext<TypebotActions>(
  {} as TypebotActions
)

/**
 * Store externo que espelha o `localTypebot` (+ `emptyFields`) para permitir
 * subscrição POR FATIA via `useSyncExternalStore`. Assim os componentes da
 * subárvore do nó (BlockNode/StepNode/conteúdos) assinam só o que usam
 * (ex.: `variables`, `edges`, um bloco) e não re-renderizam a cada edição do
 * typebot. Sob o immer, fatias não alteradas mantêm a mesma referência, então
 * o seletor faz bail-out por `Object.is`.
 */
class TypebotStore {
  private typebot?: Typebot
  private emptyFields: EmptyFields[] = []
  private listeners = new Set<() => void>()

  setSnapshot = (typebot: Typebot | undefined, emptyFields: EmptyFields[]) => {
    this.typebot = typebot
    this.emptyFields = emptyFields
  }

  getTypebot = (): Typebot | undefined => this.typebot
  getEmptyFields = (): EmptyFields[] => this.emptyFields

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit = () => {
    this.listeners.forEach((listener) => listener())
  }
}

const typebotStoreContext = createContext<TypebotStore>(new TypebotStore())

/**
 * Dados estáveis / de baixa frequência (listas auxiliares, variáveis custom,
 * typebots vinculados, setter de hideEdges...). Mudam só quando seus fetches
 * resolvem — não a cada edição do typebot. Componentes que leem apenas isto
 * deixam de re-renderizar ao editar steps.
 */
type TypebotExtras = {
  octaAgents: Array<any>
  octaGroups: Array<any>
  botFluxesList: Array<any>
  tagsList: Array<any>
  wozProfiles?: Array<any>
  customVariables: ICustomVariable[]
  linkedTypebots?: Typebot[]
  setHideEdges: Dispatch<SetStateAction<boolean>>
  setEmptyFields: SetEmptyFields
}
const typebotExtrasContext = createContext<TypebotExtras>({} as TypebotExtras)

export const TypebotContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId: string
}) => {
  const router = useRouter()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const {
    typebot,
    publishedTypebot,
    webhooks,
    isReadOnly,
    isLoading,
    mutate,
    domain,
  } = useFetchedTypebot({
    typebotId,
    onError: (error) =>
      toast({
        title: 'Error while fetching typebot',
        description: error.message,
      }),
  })

  const updateLocalTypebot = (updates: UpdateTypebotPayload) =>
    localTypebot && setLocalTypebot({ ...localTypebot, ...updates })

  const { emptyFields, setEmptyFields } = useEmptyFields()
  const [
    { present: localTypebot },
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      presentRef: currentTypebotRef,
    },
  ] = useUndo<Typebot | undefined>(undefined)

  const linkedTypebotIds = localTypebot?.blocks
    .flatMap((b) => b.steps)
    .reduce<string[]>(
      (typebotIds, step) =>
        step.type === LogicStepType.TYPEBOT_LINK &&
        isDefined(step.options.typebotId)
          ? [...typebotIds, step.options.typebotId]
          : typebotIds,
      []
    )

  const { typebots: linkedTypebots } = useLinkedTypebots({
    workspaceId: localTypebot?.workspaceId ?? undefined,
    typebotId,
    typebotIds: linkedTypebotIds,
    onError: (error) =>
      toast({
        title: 'Error while fetching linkedTypebots',
        description: error.message,
      }),
  })

  useEffect(() => {
    if (!typebot || !currentTypebotRef.current) return
    const parsedTypebot = {
      ...typebot,
      blocks: updateBlocksHasConnections(typebot),
    }
    if (typebotId !== currentTypebotRef.current.id) {
      setLocalTypebot({ ...parsedTypebot }, { updateDate: false })
      flush()
    } else if (
      new Date(typebot.updatedAt) >
      new Date(currentTypebotRef.current.updatedAt)
    ) {
      setLocalTypebot({ ...parsedTypebot }, { skipHistory: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot])

  useEffect(() => {
    const currentTypebot = currentTypebotRef.current

    if (!currentTypebot) return

    const hasBlocksWithoutConection = currentTypebot.blocks.some(
      (b) => !b.hasConnection
    )

    const hasPendingIssues = hasBlocksWithoutConection || emptyFields.length > 0

    if (currentTypebot.hasPendingIssues === hasPendingIssues) return

    setLocalTypebot({ ...currentTypebot, hasPendingIssues }, { skipHistory: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTypebot?.edges, emptyFields])

  const saveTypebot = async (
    personaName?: string,
    personaThumbUrl?: string,
    options?: { disableMutation: boolean }
  ) => {
    const currentSubDomain = subDomain.getSubDomain()

    const typebotToSave = {
      ...currentTypebotRef.current,
      updatedAt: new Date().toISOString(),
      subDomain: currentSubDomain || '',
      persona: {
        name: personaName,
        thumbUrl: personaThumbUrl,
      },
    }

    setIsSavingLoading(true)
    const { error } = await updateTypebot(
      typebotToSave?.id || '',
      typebotToSave as Typebot
    )
    setIsSavingLoading(false)
    if (error) {
      toast({ title: error.name, description: error.message })
      return false
    }

    if (!options?.disableMutation)
      mutate(
        {
          typebot: typebotToSave,
          publishedTypebot,
          webhooks: webhooks ?? [],
        },
        { revalidate: false }
      )
    window.removeEventListener('beforeunload', preventUserFromRefreshing)

    return { saved: true, updateAt: typebotToSave.updatedAt }
  }

  const savePublishedTypebot = async (newPublishedTypebot: PublicTypebot) => {
    setIsPublishing(true)
    const { error } = await updatePublishedTypebot(
      newPublishedTypebot.id,
      newPublishedTypebot
    )
    setIsPublishing(false)
    if (error) return toast({ title: error.name, description: error.message })
    mutate(
      {
        typebot: currentTypebotRef.current as Typebot,
        publishedTypebot: newPublishedTypebot,
        webhooks: webhooks ?? [],
      },
      { revalidate: false }
    )
  }

  useEffect(() => {
    const save = () =>
      saveTypebot(typebot?.persona?.name, typebot?.persona?.thumbUrl, {
        disableMutation: true,
      })
    Router.events.on('routeChangeStart', save)
    return () => {
      Router.events.off('routeChangeStart', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot, publishedTypebot, webhooks])

  const [isSavingLoading, setIsSavingLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(publishedTypebot) &&
      checkIfPublished(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot) return
    currentTypebotRef.current = localTypebot
  }, [localTypebot])

  useEffect(() => {
    if (isLoading) return

    if (!typebot) {
      toast({ status: 'info', description: "Couldn't find typebot" })

      router.replace(`${config.basePath || ''}/typebots`)

      return
    }

    const parsedTypebot = {
      ...typebot,
      blocks: updateBlocksHasConnections(typebot),
    }

    setLocalTypebot({ ...parsedTypebot })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useRegisterActions(
    [
      {
        id: 'save',
        name: 'Save typebot',
        perform: () => saveTypebot(),
      },
    ],
    [typebot, publishedTypebot, webhooks]
  )

  useRegisterActions(
    [
      {
        id: 'undo',
        name: 'Undo changes',
        perform: undo,
      },
    ],
    [localTypebot]
  )

  const publishTypebot = async () => {
    if (!localTypebot) return
    const publishedTypebotId = cuid()
    const newLocalTypebot = { ...localTypebot }
    if (publishedTypebot && isNotDefined(localTypebot.publishedTypebotId)) {
      updateLocalTypebot({ publishedTypebotId: publishedTypebot.id })
      await saveTypebot()
    }
    if (!publishedTypebot) {
      const newPublicId = parseDefaultPublicId(
        localTypebot.name,
        localTypebot.id
      )
      updateLocalTypebot({ publicId: newPublicId, publishedTypebotId })
      newLocalTypebot.publicId = newPublicId
      await saveTypebot()
    }
    if (publishedTypebot) {
      await savePublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebot.id,
      })
    } else {
      setIsPublishing(true)
      const { data, error } = await createPublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebotId,
      })
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
      mutate({
        typebot: localTypebot,
        publishedTypebot: data,
        webhooks: webhooks ?? [],
      })
    }
  }

  const updateOnBothTypebots = async (updates: {
    publicId?: string
    name?: string
    customDomain?: string | null
  }) => {
    updateLocalTypebot(updates)
    await saveTypebot()
    if (!publishedTypebot) return
    await savePublishedTypebot({
      ...publishedTypebot,
      ...updates,
    })
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(parsePublicTypebotToTypebot(publishedTypebot, localTypebot))
    return saveTypebot()
  }

  const updateWebhook = async (
    webhookId: string,
    updates: Partial<Webhook>
  ) => {
    if (!typebot) return
    const { data } = await saveWebhook(webhookId, updates)
    if (data)
      mutate({
        typebot,
        publishedTypebot,
        webhooks: (webhooks ?? []).map((w) =>
          w.id === webhookId ? data.webhook : w
        ),
      })
  }

  const [octaAgents, setOctaAgents] = useState<Array<any>>([])
  useEffect(
    (
      shouldGetAgents = true,
      shouldGetGroups = true,
      shouldGetDefault = true
    ) => {
      const fetchOctaAgents = async (
        shouldGetAgents = true,
        shouldGetGroups = true,
        shouldGetDefault = true
      ): Promise<void> => {
        const noOne = {
          group: 'Não atribuir (Visível a todos)',
          name: 'Não atribuir (Visível a todos)',
          operationType: ASSIGN_TO.noOne,
        }
        const agentsGroupsList: Array<any> = shouldGetDefault ? [noOne] : []

        const agentPromise = shouldGetAgents
          ? Agents()
              .getAgents()
              .then((res) => {
                let agentsList = res
                  .sort((a: any, b: any) => a.name.localeCompare(b.name))
                  .map((agent: any) => ({
                    ...agent,
                    operationType: ASSIGN_TO.agent,
                  }))

                agentsList = [
                  {
                    name: 'Atribuir a conversa para um usuário',
                    disabled: true,
                    id: 'agent',
                    isTitle: true,
                  },
                  ...agentsList,
                ]

                agentsGroupsList.push(...agentsList)
              })
          : undefined

        const groupPromise = shouldGetGroups
          ? Groups()
              .getGroups()
              .then((res) => {
                let groupsList: Array<any> = []
                const groups = res
                  .sort((a: any, b: any) => a.name.localeCompare(b.name))
                  .map((group: any) => ({
                    ...group,
                    operationType: ASSIGN_TO.group,
                  }))

                groupsList = [
                  {
                    name: 'Atribuir a conversa para um grupo',
                    id: 'group',
                    disabled: true,
                    isTitle: true,
                  },
                  ...groups,
                ]

                agentsGroupsList.push(...groupsList)
              })
          : undefined

        const promises = [agentPromise, groupPromise]

        await Promise.all(promises.filter((p) => p))

        setOctaAgents(agentsGroupsList)
      }

      fetchOctaAgents(shouldGetAgents, shouldGetGroups, shouldGetDefault)

      return () => {
        setOctaAgents(() => [])
      }
    },
    []
  )

  const [octaGroups, setOctaGroups] = useState<Array<any>>([])
  useEffect(() => {
    const fetchOctaGroups = async (): Promise<void> => {
      const agentsGroupsList = await Groups()
        .getGroups()
        .then((res) => {
          return res
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((group: any) => ({
              ...group,
              operationType: ASSIGN_TO.group,
            }))
        })

      setOctaGroups(agentsGroupsList)
    }

    fetchOctaGroups()

    return () => {
      setOctaGroups(() => [])
    }
  }, [])

  const [botFluxesList, setBotFluxesList] = useState<Array<any>>([])
  useEffect(() => {
    const fluxChannel = document.referrer.split('/')
    const channel = fluxChannel[5] || 'web'
    const fetchBots = async (): Promise<void> => {
      const v1V2BotsList: Array<any> = []
      Promise.all([
        BotsService()
          .getBots(channel, 1)
          .then((res) => {
            let v1FluxList = res.fluxes
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((flux: any, idx: number) => ({
                ...flux,
                label: flux.name,
                value: { fluxId: flux.id },
                key: `v1 - ${idx}`,
                isTitle: false,
              }))

            v1FluxList = [
              {
                name: 'Bots V1',
                label: 'Bots V1',
                disabled: true,
                id: 'v1-title',
                isTitle: true,
                key: 'v1-title',
              },
              ...v1FluxList,
            ]

            v1V2BotsList.push(...v1FluxList)
          }),
        BotsService()
          .getBots(channel, 2)
          .then((res) => {
            let v2FluxList = res.fluxes
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((flux: any, idx: number) => ({
                ...flux,
                label: flux.name,
                value: { fluxId: flux.id },
                key: `v2 - ${idx}`,
                isTitle: false,
              }))

            v2FluxList = [
              {
                name: 'Bots V2',
                label: 'Bots V2',
                disabled: true,
                id: 'v2-title',
                isTitle: true,
                key: 'v2-title',
              },
              ...v2FluxList,
            ]

            v1V2BotsList.push(...v2FluxList)
          }),
      ])

      setBotFluxesList(v1V2BotsList)
    }
    fetchBots()

    return () => {
      setBotFluxesList(() => [])
    }
  }, [])

  const [tagsList, setTagsList] = useState<Array<any>>([])
  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      const tagsList: Array<any> = []
      Promise.all([
        TagsService()
          .getAll()
          .then((res) => {
            const itemList = res
              .filter(function (tag: any) {
                return tag?.status == 'active'
              })
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((tag: any, idx: number) => ({
                ...tag,
                label: tag.name,
                value: { tag: tag.id },
                key: `tg - ${idx}`,
                isTitle: false,
              }))

            tagsList.push(...itemList)
          }),
      ])

      setTagsList(tagsList)
    }
    fetchTags()

    return () => {
      setTagsList(() => [])
    }
  }, [])

  const [hideEdges, setHideEdges] = useState(false)
  const { customVariables } = useCustomVariables()

  const { wozProfiles } = useWozProfiles()

  // Store que espelha o typebot para subscrição por fatia. Atualizamos a snapshot
  // de forma síncrona em todo render (barato) para `getSnapshot` nunca ler stale,
  // e notificamos os assinantes após o commit (layout effect) quando muda.
  const typebotStoreRef = useRef<TypebotStore>()
  if (!typebotStoreRef.current) typebotStoreRef.current = new TypebotStore()
  const typebotStore = typebotStoreRef.current
  typebotStore.setSnapshot(localTypebot, emptyFields)
  useLayoutEffect(() => {
    typebotStore.emit()
  }, [localTypebot, typebotStore])

  const extrasValue = useMemo<TypebotExtras>(
    () => ({
      octaAgents,
      octaGroups,
      botFluxesList,
      tagsList,
      wozProfiles,
      customVariables,
      linkedTypebots,
      setHideEdges,
      setEmptyFields,
    }),
    [
      octaAgents,
      octaGroups,
      botFluxesList,
      tagsList,
      wozProfiles,
      customVariables,
      linkedTypebots,
      setHideEdges,
      setEmptyFields,
    ]
  )

  // Ações memoizadas UMA vez: dependem só de setters estáveis
  // (`setLocalTypebot` e `setEmptyFields` são `useCallback([])`). Antes eram
  // recriadas a cada edição do typebot (estavam dentro do useMemo do value),
  // o que invalidava deps de effects/memo em todos os ~90 consumidores.
  const actions = useMemo(
    () => ({
      ...blocksActions(
        setLocalTypebot as SetTypebot,
        setEmptyFields as SetEmptyFields
      ),
      ...stepsAction(
        setLocalTypebot as SetTypebot,
        setEmptyFields as SetEmptyFields
      ),
      ...variablesAction(setLocalTypebot as SetTypebot),
      ...edgesAction(setLocalTypebot as SetTypebot),
      ...itemsAction(setLocalTypebot as SetTypebot),
    }),
    [setLocalTypebot, setEmptyFields]
  )

  const contextValue = useMemo(() => {
    return {
      domain,
      typebot: localTypebot,
      customVariables: customVariables,
      emptyFields,
      setEmptyFields,
      hideEdges,
      setHideEdges,
      currentTypebot: typebot,
      publishedTypebot,
      linkedTypebots,
      isReadOnly,
      isSavingLoading,
      save: saveTypebot,
      undo,
      redo,
      canUndo,
      canRedo,
      publishTypebot,
      isPublishing,
      isPublished,
      updateTypebot: updateLocalTypebot,
      restorePublishedTypebot,
      updateOnBothTypebots,
      updateWebhook,
      ...actions,
      octaAgents,
      octaGroups,
      botFluxesList,
      tagsList,
      wozProfiles,
    }
  }, [
    domain,
    localTypebot,
    customVariables,
    emptyFields,
    setEmptyFields,
    hideEdges,
    typebot,
    publishedTypebot,
    linkedTypebots,
    isReadOnly,
    isSavingLoading,
    saveTypebot,
    undo,
    redo,
    canUndo,
    canRedo,
    publishTypebot,
    isPublishing,
    isPublished,
    updateLocalTypebot,
    restorePublishedTypebot,
    updateOnBothTypebots,
    updateWebhook,
    actions,
    octaAgents,
    octaGroups,
    botFluxesList,
    tagsList,
    wozProfiles,
  ])
  return (
    <typebotContext.Provider value={contextValue}>
      <typebotStoreContext.Provider value={typebotStore}>
        <typebotExtrasContext.Provider value={extrasValue}>
          <typebotActionsContext.Provider value={actions}>
            {children}
          </typebotActionsContext.Provider>
        </typebotExtrasContext.Provider>
      </typebotStoreContext.Provider>
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)

export const useTypebotActions = () => useContext(typebotActionsContext)

export const useTypebotExtras = () => useContext(typebotExtrasContext)

/**
 * Acessor NÃO-reativo do typebot atual — para uso em handlers/effects sem
 * assinar (não causa re-render). Para ler dados em render, use
 * `useTypebotSelector`.
 */
export const useGetTypebot = () => {
  const store = useContext(typebotStoreContext)
  return store.getTypebot
}

/** Acessor não-reativo de emptyFields (uso em effects de validação). */
export const useGetEmptyFields = () => {
  const store = useContext(typebotStoreContext)
  return store.getEmptyFields
}

/**
 * Subscreve uma FATIA do typebot. O componente só re-renderiza quando o valor
 * selecionado muda de identidade (`Object.is`). O seletor DEVE retornar uma
 * referência existente (fatia) ou primitivo — nunca um objeto recém-criado.
 */
export function useTypebotSelector<T>(
  selector: (typebot: Typebot | undefined) => T
): T {
  const store = useContext(typebotStoreContext)
  const lastTypebot = useRef<Typebot | undefined>(undefined)
  const lastSelected = useRef<T>(undefined as unknown as T)
  const hasValue = useRef(false)
  const getSnapshot = () => {
    const current = store.getTypebot()
    if (!hasValue.current || lastTypebot.current !== current) {
      lastTypebot.current = current
      lastSelected.current = selector(current)
      hasValue.current = true
    }
    return lastSelected.current
  }
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

/** Atalhos comuns construídos sobre `useTypebotSelector`. */
export const useTypebotVariables = () =>
  useTypebotSelector((t) => t?.variables)
export const useTypebotEdges = () => useTypebotSelector((t) => t?.edges)
export const useTypebotAvailableFor = () =>
  useTypebotSelector((t) => t?.availableFor)
export const useHasTypebot = () => useTypebotSelector((t) => !!t)

export const useFetchedTypebot = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    {
      typebot: Typebot
      webhooks: Webhook[]
      publishedTypebot?: PublicTypebot
      isReadOnly?: boolean
    },
    Error
  >(`/getTypebot-${typebotId}`, fetcher, {
    dedupingInterval: 60000 * 60 * 24,
    revalidateOnFocus: false,
  })

  if (error) onError(error)
  return {
    domain: data?.typebot?.domain,
    typebot: data?.typebot,
    webhooks: data?.webhooks,
    publishedTypebot: data?.publishedTypebot,
    isReadOnly: data?.isReadOnly,
    isLoading: !error && !data,
    mutate,
  }
}

const useLinkedTypebots = ({
  workspaceId,
  typebotId,
  typebotIds,
  onError,
}: {
  workspaceId?: string
  typebotId?: string
  typebotIds?: string[]
  onError: (error: Error) => void
}) => {
  const params = stringify({ typebotIds, workspaceId }, { indices: false })
  const { data, error, mutate } = useSWR<
    {
      typebots: Typebot[]
    },
    Error
  >(
    typebotIds?.every((id) => typebotId === id)
      ? undefined
      : `${config.basePath || ''}/api/typebots?${params}`,
    fetcher
  )
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}

const useAutoSave = <T,>(
  {
    handler,
    item,
    debounceTimeout,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: () => Promise<any>
    item?: T
    debounceTimeout: number
  },
  dependencies: unknown[]
) => {
  const [debouncedItem] = useDebounce(item, debounceTimeout)
  useEffect(() => {
    const save = () => handler()
    document.addEventListener('visibilitychange', save)
    return () => {
      document.removeEventListener('visibilitychange', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  return useEffect(() => {
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedItem])
}
