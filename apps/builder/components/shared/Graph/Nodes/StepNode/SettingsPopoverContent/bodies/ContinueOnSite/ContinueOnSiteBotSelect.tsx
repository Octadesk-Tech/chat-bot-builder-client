import React, { useEffect, useState } from 'react'
import { Text } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import { BotsService } from 'services/octadesk/bots/bots'
import { Channels } from 'enums/channels'

type Props = {
  selectedFluxId?: string
  onSelect: (fluxId: string) => void
}

type WebFlux = {
  id: string
  name: string
}

const WEB_BOT_VERSION = 2

export const ContinueOnSiteBotSelect = ({ selectedFluxId, onSelect }: Props) => {
  const [options, setOptions] = useState<Array<OptionType>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchWebBots = async (): Promise<void> => {
      try {
        const res = await BotsService().getBots(Channels.WEB, WEB_BOT_VERSION)
        const fluxes: Array<WebFlux> = res?.fluxes ?? []

        const mapped = fluxes
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((flux) => ({
            label: flux.name,
            value: flux.id,
            key: flux.id,
          }))

        if (isMounted) setOptions(mapped)
      } catch {
        if (isMounted) setHasError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchWebBots()

    return () => {
      isMounted = false
    }
  }, [])

  const handleOnChange = (value: string): void => {
    if (value) onSelect(value)
  }

  if (hasError) {
    return (
      <Text fontSize="sm" color="red.500">
        Não foi possível carregar os bots do widget.
      </Text>
    )
  }

  return (
    <OctaSelect
      placeholder={
        isLoading ? 'Carregando bots...' : 'Selecione o bot do widget'
      }
      defaultSelected={selectedFluxId}
      findable
      options={options}
      onChange={handleOnChange}
    />
  )
}
