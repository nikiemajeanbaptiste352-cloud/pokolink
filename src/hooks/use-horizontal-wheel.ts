import { useEffect, useRef, type RefObject } from 'react'

/**
 * Sur une rangée horizontale : la molette verticale fait défiler latéralement
 * (utile sur bureau où la barre est absente ou peu visible).
 */
export function useHorizontalWheel<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    function onWheel(event: WheelEvent) {
      if (!node || event.deltaY === 0) return
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      if (node.scrollWidth <= node.clientWidth) return
      event.preventDefault()
      node.scrollLeft += event.deltaY
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  return ref
}
