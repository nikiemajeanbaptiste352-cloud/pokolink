import { useEffect, useRef } from 'react'

import { PRO_TABS, type ProTabId } from '@/lib/pro-tabs'
import { cn } from '@/lib/utils'

interface ProTabsProps {
  value: ProTabId
  onChange: (tab: ProTabId) => void
  /** Pastille de nombre sur une rubrique (ex. événements à venir). */
  counts?: Partial<Record<ProTabId, number>>
}

/**
 * Navigation storefront (Amazon / Alibaba) : onglets soulignés marque, collés sous le hero.
 */
export function ProTabs({ value, onChange, counts = {} }: ProTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = activeRef.current
    const list = button?.parentElement?.parentElement
    if (!button || !list) return
    list.scrollTo({
      left: button.offsetLeft - (list.clientWidth - button.offsetWidth) / 2,
    })
  }, [value])

  return (
    <nav
      aria-label="Rubriques de la boutique"
      className="sticky top-0 z-20 border-b bg-card/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur"
    >
      <ul className="relative flex scrollbar-none overflow-x-auto px-1">
        {PRO_TABS.map((tab) => {
          const active = tab.id === value
          const count = counts[tab.id] ?? 0
          return (
            <li key={tab.id} className="shrink-0">
              <button
                ref={active ? activeRef : undefined}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative inline-flex h-11 items-center gap-1.5 px-3.5 text-[13px] font-bold whitespace-nowrap transition-colors',
                  active
                    ? 'text-brand'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                {count > 0 ? (
                  <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-brand-foreground">
                    {count}
                    <span className="sr-only"> à venir</span>
                  </span>
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-brand transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
