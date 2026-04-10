import useSWR from 'swr'
import { fetchSelectTokens } from './service'

export const SELECT_TOKENS_SWR_KEY = 'selectTokens'

export function useSelectTokens() {
  const { data, error, isValidating, mutate } = useSWR(
    SELECT_TOKENS_SWR_KEY,
    async () => {
      const data = await fetchSelectTokens()
      return data?.data?.map((item) => ({
        id: item.id,
        name: `$${item.name}`,
      }))
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  return {
    tokens: data ?? [],
    error,
    isLoading: data === undefined && !error,
    isValidating,
    mutate,
  }
}
