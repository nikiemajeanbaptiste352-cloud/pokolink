import { useSyncExternalStore } from 'react'

import { getStudioEvents, subscribeStudio } from '@/lib/studio-store'
import type { StudioEvent } from '@/types/studio'

/** Événements du créateur, du plus récemment modifié au plus ancien. */
export function useStudioEvents(): readonly StudioEvent[] {
  return useSyncExternalStore(subscribeStudio, getStudioEvents)
}

/** Un événement du créateur, ou `undefined` s'il n'existe pas (ou plus). */
export function useStudioEvent(id: string | undefined): StudioEvent | undefined {
  const events = useStudioEvents()
  return events.find((event) => event.id === id)
}
