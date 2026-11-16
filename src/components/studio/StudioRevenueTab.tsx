import { Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatTile } from '@/components/pro/shared'
import { StudioSection } from '@/components/studio/parts'
import { buttonVariants } from '@/components/ui/button'
import { formatCount, formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import {
  CREATOR_EVENT_COMMISSION_RATE,
  getCreatorCommission,
  getEndsAt,
  getEventCollected,
  getEventTitle,
  sumStats,
} from '@/lib/studio'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

const COMMISSION_PCT = Math.round(CREATOR_EVENT_COMMISSION_RATE * 100)

/**
 * Revenus du créateur : 2 % de commission sur le volume de chaque événement.
 */
export function StudioRevenueTab({ events }: { events: readonly StudioEvent[] }) {
  const ended = events.filter((event) => event.status === 'ended')
  const totals = sumStats(ended)

  return (
    <div className="space-y-6">
      <section aria-label="Total" className="px-4">
        <dl className="grid grid-cols-2 gap-3">
          <StatTile
            label={`Commission ${COMMISSION_PCT} % (terminé)`}
            value={`${formatCount(totals.revenue)} FCFA`}
          />
          <StatTile label="Événements terminés" value={String(ended.length)} />
          <StatTile
            label="Volume total"
            value={`${formatCount(totals.collected)} FCFA`}
            className="col-span-2"
          />
        </dl>
        <p className="mt-2 text-caption text-muted-foreground">
          Votre revenu = {COMMISSION_PCT} % du volume (mises / ventes) de chaque
          événement.
        </p>
      </section>

      <StudioSection
        title="Événements terminés"
        description={`Commission ${COMMISSION_PCT} % · du plus récent au plus ancien.`}
      >
        {ended.length === 0 ? (
          <p className="text-body text-muted-foreground">
            Aucun événement terminé pour le moment.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card px-3.5">
            {[...ended]
              .sort((a, b) => getEndsAt(b) - getEndsAt(a))
              .map((event) => {
                const collected = getEventCollected(event)
                const commission = getCreatorCommission(event)
                return (
                  <li
                    key={event.id}
                    className="flex items-baseline justify-between gap-3 py-3"
                  >
                    <Link
                      to={paths.studioEvent(event.id)}
                      className="min-w-0 text-body font-semibold"
                    >
                      <span className="block truncate">{getEventTitle(event)}</span>
                      <span className="block text-caption font-normal text-muted-foreground">
                        Terminé le {formatDateTime(getEndsAt(event))}
                        {collected !== null
                          ? ` · Volume ${formatPrice(collected)}`
                          : ''}
                      </span>
                    </Link>
                    <span className="shrink-0 text-right text-body font-extrabold tabular-nums">
                      {commission === null ? (
                        <span className="text-caption font-normal text-muted-foreground">
                          —
                        </span>
                      ) : (
                        <>
                          <span className="block">{formatPrice(commission)}</span>
                          <span className="block text-caption font-normal text-muted-foreground">
                            {COMMISSION_PCT} %
                          </span>
                        </>
                      )}
                    </span>
                  </li>
                )
              })}
          </ul>
        )}
        <Link
          to={paths.studioTab('statistiques')}
          className="inline-flex min-h-11 items-center text-body font-semibold text-brand underline"
        >
          Voir le graphique des revenus
        </Link>
      </StudioSection>

      <StudioSection
        title="Versements"
        description="Suivi des commissions créditées sur votre Wallet."
      >
        <ul className="list-disc space-y-1.5 pl-5 text-body">
          <li>L’état de chaque versement : en attente, versé, refusé.</li>
          <li>L’historique des versements, avec leur référence.</li>
        </ul>
        <Link to={paths.wallet} className={buttonVariants({ variant: 'outline' })}>
          <Wallet aria-hidden="true" />
          Ouvrir mon Wallet
        </Link>
      </StudioSection>
    </div>
  )
}
