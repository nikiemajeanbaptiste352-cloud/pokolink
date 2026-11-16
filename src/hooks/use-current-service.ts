import { useOutletContext } from 'react-router-dom'

import type { Service } from '@/types/service'

/** Service courant, fourni par `ServiceLayout` aux écrans de son espace professionnel. */
export function useCurrentService(): Service {
  return useOutletContext<Service>()
}
