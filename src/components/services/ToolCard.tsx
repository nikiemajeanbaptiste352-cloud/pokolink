import { Link } from 'react-router-dom'

import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { ServiceTool } from '@/types/service'

interface ToolCardProps {
  tool: ServiceTool
  to: string
  className?: string
}

/** Tuile d'accès à un outil de l'espace professionnel. */
export function ToolCard({ tool, to, className }: ToolCardProps) {
  const Icon = tool.icon

  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-32 flex-col items-start gap-3 rounded-xl border bg-card p-3.5 text-left shadow-card transition-colors hover:bg-muted',
        className,
      )}
    >
      <span
        className={cn('grid size-11 place-items-center rounded-xl', toneSoft[tool.tone])}
      >
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="space-y-0.5">
        <span className="block text-body font-bold">{tool.label}</span>
        <span className="block text-caption text-muted-foreground">
          {tool.description}
        </span>
      </span>
    </Link>
  )
}
