import React, { useEffect, useRef } from 'react'
import { useFrame } from 'react-frame-component'

export const LiteBadge = () => {
  const { document } = useFrame()
  const liteBadge = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const container = document.querySelector(
      '[data-testid="container"]'
    ) as HTMLDivElement
    const observer = new MutationObserver(function (mutations_list) {
      mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
          if ((removed_node as HTMLElement).id == 'lite-badge') {
            container.append(liteBadge.current as Node)
          }
        })
      })
    })
    observer.observe(container, {
      subtree: false,
      childList: true,
    })

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <a
      ref={liteBadge}
      href={'https://www.typebot.io/?utm_source=litebadge'}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed py-1 px-2 bg-white z-50 rounded shadow-md lite-badge"
      style={{ bottom: '20px' }}
      id="lite-badge"
    >
      Made with <span className="text-blue-500">Typebot</span>.
    </a>
  )
}
