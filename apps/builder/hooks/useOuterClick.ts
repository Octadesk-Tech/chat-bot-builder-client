import { useState, useEffect, useRef } from 'react'

export default function useOuterClick(initialIsVisible: boolean) {
  const [isComponentVisible, setIsComponentVisible] =
    useState<boolean>(initialIsVisible)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleHideDropdown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsComponentVisible(false)
      }
    }
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsComponentVisible(false)
      }
    }
    document.addEventListener('keydown', handleHideDropdown, true)
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('keydown', handleHideDropdown, true)
      document.removeEventListener('click', handleClickOutside, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, isComponentVisible, setIsComponentVisible }
}
