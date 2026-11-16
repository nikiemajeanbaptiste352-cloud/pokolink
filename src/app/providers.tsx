import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { queryClient } from '@/lib/query-client'

import { ServicesProvider } from './services-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServicesProvider>{children}</ServicesProvider>
    </QueryClientProvider>
  )
}
