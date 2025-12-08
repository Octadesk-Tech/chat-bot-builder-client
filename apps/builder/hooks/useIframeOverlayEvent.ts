import { useEffect, useRef } from 'react'

type OverlayType = 'modal' | 'popover'

type OverlayEventPayload = {
  name: 'overlayOpened' | 'overlayClosed'
  overlayType: OverlayType
  overlayId?: string
}

const postOverlayMessage = (payload: OverlayEventPayload) => {
  if (typeof window === 'undefined') return

  try {
    window.parent.postMessage(payload, '*')
  } catch(error) {
    console.error('Failed to post overlay event to parent iframe', error)
  }
}

export const useIframeOverlayEvent = (
  isOpen: boolean,
  overlayType: OverlayType,
  overlayId?: string
) => {
  const previousIsOpen = useRef<boolean>(isOpen)

  useEffect(() => {
    if (previousIsOpen.current === isOpen) return

    const eventName: OverlayEventPayload['name'] = isOpen
      ? 'overlayOpened'
      : 'overlayClosed'

    postOverlayMessage({
      name: eventName,
      overlayType,
      overlayId,
    })

    previousIsOpen.current = isOpen
  }, [isOpen, overlayId, overlayType])
}


