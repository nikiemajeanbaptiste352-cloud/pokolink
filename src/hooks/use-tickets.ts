import { useMemo, useSyncExternalStore } from 'react'

import type { TicketPro } from '@/components/tickets/TicketCard'
import { usePublicPro } from '@/hooks/use-public-pro'
import { usePurchases } from '@/hooks/use-purchases'
import {
  findIssuedTicket,
  getIssuedTickets,
  subscribeIssuedTickets,
} from '@/lib/issued-tickets-store'
import { TEMP_TICKETS } from '@/lib/placeholder-tickets'
import { logoForPurchase, ticketFromPurchase } from '@/lib/purchase-tickets'
import { getServiceTypeMeta } from '@/lib/service-types'
import { applyOverride, getTicketOverrides, subscribeTickets } from '@/lib/tickets-store'
import type { PaymentTicket } from '@/types/ticket'

/**
 * Tickets : émis localement après confirmation PIN (prioritaires), puis achats confirmés,
 * puis exemples. Chaque ticket porte le logo de l'espace pro lorsqu'il est connu.
 */
export function useTickets(): PaymentTicket[] {
  const overrides = useSyncExternalStore(subscribeTickets, getTicketOverrides)
  const issued = useSyncExternalStore(subscribeIssuedTickets, getIssuedTickets)
  const purchases = usePurchases()
  return useMemo(() => {
    const fromPurchases = purchases
      .map(ticketFromPurchase)
      .filter((ticket): ticket is PaymentTicket => ticket !== undefined)
    const demo = TEMP_TICKETS.map((ticket) => applyOverride(ticket, overrides))
    const ids = new Set<string>()
    const merged: PaymentTicket[] = []
    for (const ticket of [...issued, ...fromPurchases, ...demo]) {
      if (ids.has(ticket.id)) continue
      ids.add(ticket.id)
      merged.push(ticket)
    }
    return merged
  }, [overrides, issued, purchases])
}

export function useMyTickets(): PaymentTicket[] {
  const tickets = useTickets()
  return useMemo(
    () => tickets.filter((ticket) => ticket.mine).sort((a, b) => b.paidAt - a.paidAt),
    [tickets],
  )
}

export function useServiceTickets(serviceId: string): PaymentTicket[] {
  const tickets = useTickets()
  return useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.serviceId === serviceId)
        .sort((a, b) => b.paidAt - a.paidAt),
    [tickets, serviceId],
  )
}

/** Ticket par id (émis local, achat ou exemple). */
export function useTicket(ticketId: string | undefined): PaymentTicket | undefined {
  const tickets = useTickets()
  return useMemo(() => {
    if (!ticketId) return undefined
    return tickets.find((ticket) => ticket.id === ticketId) ?? findIssuedTicket(ticketId)
  }, [ticketId, tickets])
}

/** Affichage Espace Pro sur le ticket : logo figé ou annuaire. */
export function useTicketPro(ticket: PaymentTicket): TicketPro {
  const pro = usePublicPro(ticket.proRef)
  const purchases = usePurchases()
  return useMemo(() => {
    const fromPurchase = purchases.find(
      (purchase) =>
        ticket.id === `purchase-ticket-${purchase.id}` ||
        purchase.proRef === ticket.proRef,
    )
    const logo =
      ticket.providerLogo ||
      (fromPurchase ? logoForPurchase(fromPurchase) : undefined) ||
      pro?.service.logo ||
      undefined
    const name =
      ticket.providerName ||
      pro?.service.name ||
      fromPurchase?.sellerName ||
      'Service Pro'
    if (!pro) {
      return {
        name,
        verified: Boolean(ticket.local),
        domain: '',
        ...(logo ? { logo } : {}),
      }
    }
    return {
      name: pro.service.name,
      logo,
      verified: pro.verified,
      domain: pro.tagline || getServiceTypeMeta(pro.service.type).label,
    }
  }, [pro, purchases, ticket])
}
