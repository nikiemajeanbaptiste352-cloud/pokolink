import { useCallback, useEffect, useRef, useState } from 'react'

/** Message de confirmation éphémère (4 secondes) après une action. */
export function useFlash() {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flash = useCallback((text: string) => {
    window.clearTimeout(timer.current)
    setMessage(text)
    timer.current = window.setTimeout(() => setMessage(''), 4000)
  }, [])

  return { message, flash }
}
