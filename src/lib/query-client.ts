import { QueryClient } from '@tanstack/react-query'

/**
 * Client TanStack Query partagé.
 * Préparé pour la future API : aucune requête n'est encore émise.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
