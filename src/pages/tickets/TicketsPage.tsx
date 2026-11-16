import { Crown, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { SubscriptionRow } from '@/components/subscriptions/SubscriptionRow'
import { TicketRow } from '@/components/tickets/TicketRow'
import { buttonVariants } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { useMySubscriptionCards } from '@/hooks/use-subscription-cards'
import { useMyTickets } from '@/hooks/use-tickets'
import { TICKET_STATUS, TICKET_STATUS_ORDER } from '@/lib/ticket-labels'
import { paths } from '@/routes/paths'
import type { TicketStatus } from '@/types/ticket'

type Filter = 'all' | TicketStatus
type View = 'tickets' | 'subscriptions'

const VIEWS: readonly { id: View; label: string }[] = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'subscriptions', label: 'Abonnements' },
]

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  ...TICKET_STATUS_ORDER.map((id) => ({ id, label: TICKET_STATUS[id].label })),
]

function SubscriptionsList() {
  const cards = useMySubscriptionCards()
  const now = useNow(60_000)

  return (
    <>
      {cards.length === 0 ? (
        <EmptyState
          icon={Crown}
          tone="gold"
          title="Aucun abonnement pour l’instant"
          description="Souscrivez à un forfait depuis la page d’un Service Pro : votre carte d’abonnement apparaît ici."
          action={
            <Link to={paths.explore} className={buttonVariants()}>
              Découvrir des offres
            </Link>
          }
          className="py-16"
        />
      ) : (
        <ul className="divide-y">
          {cards.map((card) => (
            <li key={card.id}>
              <SubscriptionRow card={card} now={now} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function TicketsList() {
  const [filter, setFilter] = useState<Filter>('all')
  const tickets = useMyTickets()
  const visible = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)

  return (
    <>
      <FilterChips
        label="Statut du ticket"
        items={FILTERS}
        value={filter}
        onChange={setFilter}
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Aucun ticket pour l’instant"
          description="Après chaque paiement confirmé auprès d’un Service Pro, votre ticket apparaît ici."
          action={
            <Link to={paths.explore} className={buttonVariants()}>
              Découvrir des offres
            </Link>
          }
          className="py-16"
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Aucun ticket"
          description="Rien à afficher pour ce statut."
          className="py-10"
        />
      ) : (
        <ul className="space-y-2.5 pb-2">
          {visible.map((ticket) => (
            <li key={ticket.id}>
              <TicketRow ticket={ticket} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/** Mes tickets de paiement et mes cartes d'abonnement. */
export function TicketsPage() {
  const [params, setParams] = useSearchParams()
  const view: View = params.get('vue') === 'abonnements' ? 'subscriptions' : 'tickets'

  function changeView(next: View) {
    setParams(next === 'subscriptions' ? { vue: 'abonnements' } : {}, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Tickets"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />

      <div className="space-y-4 py-4">
        <FilterChips label="Type" items={VIEWS} value={view} onChange={changeView} />
        {view === 'tickets' ? <TicketsList /> : <SubscriptionsList />}
      </div>
    </>
  )
}
