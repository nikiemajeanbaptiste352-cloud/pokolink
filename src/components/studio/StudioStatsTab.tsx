import { ChartNoAxesColumn } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { StatTile } from '@/components/pro/shared'
import { MetricChart } from '@/components/studio/MetricChart'
import { ProgressBar, StudioSection } from '@/components/studio/parts'
import { formatCount, formatNumber } from '@/lib/format'
import { getEventTitle, STUDIO_KINDS, sumStats, withStats } from '@/lib/studio'
import { paths } from '@/routes/paths'
import type { StudioEvent, StudioEventKind } from '@/types/studio'

type KindFilter = 'all' | StudioEventKind

const KIND_FILTERS: readonly { id: KindFilter; label: string }[] = [
  { id: 'all', label: 'Tous les types' },
  { id: 'factor', label: 'Cotes' },
  { id: 'coins', label: 'Coins' },
]

/** Pourcentage d'interactions (J'aime + commentaires + partages) par vue : indicatif. */
function formatReactionRate(reactions: number, views: number): string {
  if (views <= 0) return '—'
  return `${((reactions / views) * 100).toFixed(1).replace('.', ',')} %`
}

/**
 * Statistiques d'ensemble. Tous les chiffres viennent du serveur par événement ; l'écran ne
 * fait que les additionner ou les comparer pour l'affichage. Aucun montant n'est calculé ici.
 */
export function StudioStatsTab({ events }: { events: readonly StudioEvent[] }) {
  const [kind, setKind] = useState<KindFilter>('all')

  const measured = withStats(events).filter(
    (event) => kind === 'all' || event.kind === kind,
  )
  const totals = sumStats(measured)
  const reactions = totals.likes + totals.comments + totals.shares

  const byViews = measured
    .filter((event) => (event.stats?.views ?? 0) > 0)
    .sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0))
  const topViews = byViews[0]?.stats?.views ?? 0

  const coinEvents = measured.filter(
    (event) =>
      event.kind === 'coins' &&
      event.maxCoins !== undefined &&
      event.stats?.soldCoins !== undefined,
  )

  const countByKind = (id: StudioEventKind) =>
    measured.filter((event) => event.kind === id)

  return (
    <div className="space-y-6">
      <FilterChips
        label="Type d’événement"
        items={KIND_FILTERS}
        value={kind}
        onChange={setKind}
      />

      {measured.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesColumn}
          tone="violet"
          title="Pas encore de statistiques"
          description="Elles apparaissent dès qu’un de vos événements est programmé ou commence."
          action={
            <Link
              to={paths.studioTab('evenements')}
              className="text-body font-semibold text-brand underline"
            >
              Voir mes événements
            </Link>
          }
          className="py-8"
        />
      ) : (
        <>
          <StudioSection
            title="Vues, participants et commission 2 %"
            description="Choisissez la mesure : chaque colonne est un événement."
          >
            <MetricChart events={measured} />
          </StudioSection>

          <section aria-label="Totaux" className="space-y-2 px-4">
            <dl className="grid grid-cols-2 gap-3">
              <StatTile label="Événements suivis" value={String(measured.length)} />
              <StatTile label="Vues validées" value={formatCount(totals.views)} />
              <StatTile label="Participants" value={formatCount(totals.participants)} />
              <StatTile
                label="Commission 2 %"
                value={`${formatCount(totals.revenue)} FCFA`}
              />
              <StatTile
                label="Réactions / vues"
                value={formatReactionRate(reactions, totals.views)}
              />
              <StatTile label="J’aime" value={formatCount(totals.likes)} />
              <StatTile label="Commentaires" value={formatCount(totals.comments)} />
              <StatTile label="Partages" value={formatCount(totals.shares)} />
            </dl>
            <p className="text-caption text-muted-foreground">
              « Réactions / vues » additionne J’aime, commentaires et partages. La
              commission créateur est de 2 % du volume de chaque événement.
            </p>
          </section>

          {byViews.length > 0 ? (
            <StudioSection
              title="Vues validées par événement"
              description="Du plus regardé au moins regardé."
            >
              <ol className="space-y-3">
                {byViews.map((event) => (
                  <li key={event.id} className="space-y-1.5">
                    <Link
                      to={paths.studioEvent(event.id)}
                      className="flex items-baseline justify-between gap-3 text-body"
                    >
                      <span className="min-w-0 truncate font-semibold">
                        {getEventTitle(event)}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatNumber(event.stats?.views ?? 0)}
                      </span>
                    </Link>
                    <ProgressBar
                      value={event.stats?.views ?? 0}
                      max={topViews}
                      label={`Vues validées : ${getEventTitle(event)}`}
                    />
                  </li>
                ))}
              </ol>
            </StudioSection>
          ) : null}

          {coinEvents.length > 0 ? (
            <StudioSection
              title="Coins vendus"
              description="Part des coins vendus avant le début de chaque événement."
            >
              <ul className="space-y-3">
                {coinEvents.map((event) => {
                  const sold = event.stats?.soldCoins ?? 0
                  const max = event.maxCoins ?? 0
                  return (
                    <li key={event.id} className="space-y-1.5">
                      <Link
                        to={paths.studioEvent(event.id)}
                        className="flex items-baseline justify-between gap-3 text-body"
                      >
                        <span className="min-w-0 truncate font-semibold">
                          {getEventTitle(event)}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatNumber(sold)} / {formatNumber(max)}
                        </span>
                      </Link>
                      <ProgressBar
                        value={sold}
                        max={max}
                        label={`Coins vendus : ${getEventTitle(event)}`}
                      />
                    </li>
                  )
                })}
              </ul>
            </StudioSection>
          ) : null}

          {kind === 'all' ? (
            <StudioSection title="Par type d’événement">
              <dl className="divide-y rounded-xl border bg-card px-3.5">
                {(Object.keys(STUDIO_KINDS) as StudioEventKind[]).map((id) => {
                  const group = countByKind(id)
                  const sums = sumStats(group)
                  return (
                    <div key={id} className="space-y-0.5 py-3">
                      <dt className="text-body font-bold">{STUDIO_KINDS[id].label}</dt>
                      <dd className="text-body text-muted-foreground">
                        {group.length} événement{group.length > 1 ? 's' : ''} ·{' '}
                        {formatCount(sums.views)} vues · {formatCount(sums.participants)}{' '}
                        participants
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </StudioSection>
          ) : null}
        </>
      )}
    </div>
  )
}
