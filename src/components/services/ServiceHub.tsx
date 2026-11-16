import { Link } from 'react-router-dom'

import { useHorizontalWheel } from '@/hooks/use-horizontal-wheel'
import { SERVICE_TOOLS } from '@/lib/service-tools'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/**
 * Les rubriques de l'établissement, alignées horizontalement sous le hero : abonnements,
 * catalogue, commandes, événements, publicité… La rangée défile latéralement (molette
 * comprise) ; la dernière icône visible est coupée pour indiquer qu'il y en a d'autres.
 */
export function ServiceHub({ serviceId }: { serviceId: string }) {
  const base = paths.service(serviceId)
  const tools = SERVICE_TOOLS.filter((tool) => tool.segment !== '')
  const scroller = useHorizontalWheel<HTMLUListElement>()

  return (
    <nav aria-label="Rubriques de l’établissement" className="min-w-0 border-b bg-card">
      <ul
        ref={scroller}
        className="flex w-full min-w-0 snap-x gap-1 overflow-x-auto overscroll-x-contain px-2 py-3 pe-6 [scrollbar-width:thin]"
      >
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <li key={tool.id} className="shrink-0 snap-start">
              <Link
                to={`${base}/${tool.segment}`}
                className="flex w-[5.25rem] flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 text-center transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-2xl',
                    toneSoft[tool.tone],
                  )}
                >
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="w-full text-[11px] leading-4 font-semibold">
                  {tool.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
