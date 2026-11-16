import { cn } from '@/lib/utils'

/** Bande de séparation épaisse entre deux blocs d'une page (fil d'actualité). */
export function SectionDivider({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('h-2 bg-muted', className)} />
}
