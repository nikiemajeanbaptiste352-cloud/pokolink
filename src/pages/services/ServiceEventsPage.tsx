import { CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react'

import { ColumnChart } from '@/components/charts/ColumnChart'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { EventFormSheet, ProEventCard } from '@/components/pro/events/EventParts'
import { FlashMessage, StatusPill } from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { Button } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useFlash } from '@/hooks/use-flash'
import { useNow } from '@/hooks/use-now'
import { useProExtras } from '@/hooks/use-pro-extras'
import { EVENT_KINDS, EVENT_STATE_LABEL } from '@/lib/events'
import { formatCount } from '@/lib/format'
import { formatDateTime, getProEventState, PARTICIPATION_LABEL } from '@/lib/pro-labels'
import type { ProEvent } from '@/types/pro'

type Tab = 'current' | 'history' | 'stats'

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'current', label: 'En cours et à venir' },
  { id: 'history', label: 'Mes participations' },
  { id: 'stats', label: 'Statistiques' },
]

/**
 * Événements Market Event du prestataire : à venir, historique de participation, statistiques
 * et création. Module distinct du Marché numérique : aucune donnée de vente n'est mélangée.
 */
export function ServiceEventsPage() {
  const service = useCurrentService()
  const { data, update } = useProExtras(service)
  const now = useNow(60_000)
  const { message, flash } = useFlash()
  const [tab, setTab] = useState<Tab>('current')
  const [editor, setEditor] = useState<{ open: boolean; event: ProEvent | null }>({
    open: false,
    event: null,
  })

  const events = data.events
  const current = events
    .filter((event) => getProEventState(event, now) !== 'ended')
    .sort((a, b) => a.startsAt - b.startsAt)
  const history = events
    .filter((event) => event.participation !== 'none' || (event.mine && event.published))
    .filter(
      (event) =>
        getProEventState(event, now) === 'ended' || event.participation !== 'none',
    )
    .sort((a, b) => b.startsAt - a.startsAt)

  const participated = events.filter(
    (event) => event.participation === 'confirmed' || event.participation === 'attended',
  ).length
  const live = events.filter((event) => getProEventState(event, now) === 'live').length
  const ended = events.filter(
    (event) =>
      getProEventState(event, now) === 'ended' &&
      (event.participation === 'attended' ||
        event.participation === 'confirmed' ||
        event.mine),
  ).length
  const pending = events.filter((event) => event.participation === 'pending').length
  const declined = events.filter((event) => event.participation === 'declined').length
  const mine = events.filter((event) => event.mine)
  const knownAudience = mine.filter((event) => event.participants !== null)
  const audience = knownAudience.reduce(
    (sum, event) => sum + (event.participants ?? 0),
    0,
  )

  function saveEvent(event: ProEvent, published: boolean) {
    update((state) => {
      const exists = state.events.some((candidate) => candidate.id === event.id)
      return {
        ...state,
        events: exists
          ? state.events.map((candidate) =>
              candidate.id === event.id ? event : candidate,
            )
          : [event, ...state.events],
      }
    })
    setEditor({ open: false, event: null })
    flash(
      published
        ? 'Événement publié : visible sur votre page publique pour les visiteurs.'
        : 'Événement enregistré en brouillon (invisible au public).',
    )
  }

  function publish(event: ProEvent) {
    update((state) => ({
      ...state,
      events: state.events.map((candidate) =>
        candidate.id === event.id ? { ...candidate, published: true } : candidate,
      ),
    }))
    flash('Événement publié : les clients peuvent participer depuis la page publique.')
  }

  function request(event: ProEvent) {
    update((state) => ({
      ...state,
      events: state.events.map((candidate) =>
        candidate.id === event.id
          ? { ...candidate, participation: 'pending' }
          : candidate,
      ),
    }))
    flash('Demande de participation envoyée (démonstration).')
  }

  return (
    <RubriquePage
      toolId="events"
      subtitle={`Market Event · ${service.name}`}
      action={
        <Button onClick={() => setEditor({ open: true, event: null })}>
          <Plus aria-hidden="true" />
          Créer<span className="sr-only"> un événement</span>
        </Button>
      }
    >
      <FlashMessage message={message} />

      <FilterChips
        label="Rubriques des événements"
        items={TABS}
        value={tab}
        onChange={setTab}
      />

      {tab === 'current' ? (
        <section aria-label="Événements en cours et à venir" className="space-y-3">
          {current.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              tone="info"
              title="Aucun événement à venir"
              description="Créez le vôtre ou revenez bientôt."
              action={
                <Button onClick={() => setEditor({ open: true, event: null })}>
                  <Plus aria-hidden="true" />
                  Créer un événement
                </Button>
              }
              className="py-8"
            />
          ) : (
            <ul className="grid gap-4 px-4 sm:grid-cols-2">
              {current.map((event) => (
                <li key={event.id}>
                  <ProEventCard
                    event={event}
                    now={now}
                    onEdit={(item) => setEditor({ open: true, event: item })}
                    onPublish={publish}
                    onRequest={request}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'history' ? (
        <section aria-label="Mes participations et historique" className="space-y-3">
          {history.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Aucune participation"
              description="Les événements auxquels vous participez apparaîtront ici."
              className="py-8"
            />
          ) : (
            <ul className="divide-y border-y">
              {history.map((event) => {
                const state = getProEventState(event, now)
                return (
                  <li key={event.id} className="space-y-1.5 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 text-body font-bold">{event.title}</h3>
                      <StatusPill>{EVENT_STATE_LABEL[state]}</StatusPill>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {EVENT_KINDS[event.kind].label} · {formatDateTime(event.startsAt)}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {event.mine
                        ? 'Vous êtes l’organisateur'
                        : PARTICIPATION_LABEL[event.participation]}
                      {event.location ? ` · ${event.location}` : ''}
                      {event.participants !== null
                        ? ` · ${formatCount(event.participants)} participants`
                        : ''}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'stats' ? (
        <section aria-label="Statistiques" className="space-y-4 px-4">
          <div className="space-y-2 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]">
            <h3 className="text-body font-bold">Mes participations</h3>
            <ColumnChart
              barClass="bg-brand"
              columnRem={3.4}
              items={[
                {
                  id: 'participated',
                  value: participated,
                  valueLabel: String(participated),
                  labels: ['Participés'],
                  aria: `${participated} événements participés`,
                },
                {
                  id: 'live',
                  value: live,
                  valueLabel: String(live),
                  labels: ['En cours'],
                  aria: `${live} événements en cours`,
                },
                {
                  id: 'ended',
                  value: ended,
                  valueLabel: String(ended),
                  labels: ['Terminés'],
                  aria: `${ended} événements terminés`,
                },
                {
                  id: 'pending',
                  value: pending,
                  valueLabel: String(pending),
                  labels: ['En attente'],
                  aria: `${pending} demandes en attente`,
                },
                {
                  id: 'declined',
                  value: declined,
                  valueLabel: String(declined),
                  labels: ['Refusés'],
                  aria: `${declined} participations refusées`,
                },
              ]}
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]">
            <h3 className="text-body font-bold">Participants à vos événements</h3>
            {knownAudience.length === 0 ? (
              <p className="py-6 text-center text-body text-muted-foreground">
                Pas encore de participants : créez un événement pour voir le graphique.
              </p>
            ) : (
              <>
                <ColumnChart
                  barClass="bg-info"
                  columnRem={4.5}
                  items={knownAudience.map((event) => ({
                    id: event.id,
                    value: event.participants ?? 0,
                    valueLabel: formatCount(event.participants ?? 0),
                    labels: [event.title],
                    aria: `${event.title} : ${formatCount(event.participants ?? 0)} participants`,
                  }))}
                />
                <p className="text-caption text-muted-foreground">
                  Total : {formatCount(audience)} participants.
                </p>
              </>
            )}
          </div>
          <p className="text-caption text-muted-foreground">
            D’autres statistiques s’afficheront quand le module Market Event les fournira.
          </p>
        </section>
      ) : null}
      <EventFormSheet
        open={editor.open}
        event={editor.event}
        now={now}
        organizer={service.name}
        onClose={() => setEditor({ open: false, event: null })}
        onSave={saveEvent}
      />
    </RubriquePage>
  )
}
