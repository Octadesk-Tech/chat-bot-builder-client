import { isDefined } from '@udecode/plate-core'
import { dequal } from 'dequal'
import { updateBlocksHasConnections } from 'helpers/block-connections'
// import { diff } from 'deep-object-diff'
import { useReducer, useCallback, useRef } from 'react'
import { isNotDefined } from 'utils'

enum ActionType {
  Undo = 'UNDO',
  Redo = 'REDO',
  Set = 'SET',
  Flush = 'FLUSH',
}

export interface Actions<T> {
  set: (
    newPresent: T | ((current: T) => T),
    options?: { updateDate?: boolean; skipConnectionsUpdate?: boolean }
  ) => void
  undo: () => void
  redo: () => void
  flush: () => void
  canUndo: boolean
  canRedo: boolean
  presentRef: React.MutableRefObject<T>
}

interface Action<T> {
  type: ActionType
  newPresent?: T
  updateDate?: boolean
}

export interface State<T> {
  past: T[]
  present: T
  future: T[]
}

const initialState = {
  past: [],
  present: null,
  future: [],
}

const reducer = <T>(state: State<T>, action: Action<T>) => {
  const { past, present, future } = state

  switch (action.type) {
    case ActionType.Undo: {
      if (past.length === 0) {
        return state
      }

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      }
    }

    case ActionType.Redo: {
      if (future.length === 0) {
        return state
      }
      const next = future[0]
      const newFuture = future.slice(1)

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      }
    }

    case ActionType.Set: {
      const { newPresent, updateDate } = action
      // dequal direto faz comparação estrutural profunda com early-exit (para no
      // 1º campo diferente — o caso comum de uma edição real). Antes serializava
      // o fluxo INTEIRO 2× com JSON.stringify + parseava 2× a cada mutação.
      if (
        isNotDefined(newPresent) ||
        (present && dequal(newPresent, present))
      ) {
        return state
      }

      return {
        past: [...past, present].filter(isDefined),
        present: {
          ...newPresent,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          updatedAt: updateDate ? new Date() : newPresent.updatedAt,
        },
        future: [],
      }
    }

    case ActionType.Flush:
      return { ...initialState, present }
  }
}

const useUndo = <T>(initialPresent: T): [State<T>, Actions<T>] => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  }) as [State<T>, React.Dispatch<Action<T>>]
  const presentRef = useRef<T>(initialPresent)

  const canUndo = state.past.length !== 0
  const canRedo = state.future.length !== 0

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: ActionType.Undo })
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: ActionType.Redo })
    }
  }, [canRedo])

  const set = useCallback(
    (
      newPresent: T | ((current: T) => T),
      options: { updateDate?: boolean; skipConnectionsUpdate?: boolean } = {}
    ) => {
      const { updateDate = true, skipConnectionsUpdate = false } = options
      const updatedTypebot =
        'id' in newPresent
          ? newPresent
          : (newPresent as (current: T) => T)(presentRef.current)
      presentRef.current = updatedTypebot

      // `hasConnection` só depende de edges + estrutura de steps. Em updates que
      // não alteram conexões (ex.: coordenadas de bloco no commit do drag), o
      // caller passa `skipConnectionsUpdate` para evitar este recálculo
      // O(blocks×steps×edges) no caminho quente.
      if (updatedTypebot?.blocks && !skipConnectionsUpdate) {
        updatedTypebot.blocks = updateBlocksHasConnections(updatedTypebot)
      }

      dispatch({
        type: ActionType.Set,
        newPresent: updatedTypebot,
        updateDate,
      })
    },
    []
  )

  const flush = useCallback(() => {
    dispatch({ type: ActionType.Flush })
  }, [])

  return [state, { set, undo, redo, flush, canUndo, canRedo, presentRef }]
}

export default useUndo
