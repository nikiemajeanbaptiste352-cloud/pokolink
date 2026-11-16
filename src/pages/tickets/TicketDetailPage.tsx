import { ArrowLeft, Download, Home, Ticket } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { TicketCard } from '@/components/tickets/TicketCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { useTicket, useTicketPro } from '@/hooks/use-tickets'
import { paths } from '@/routes/paths'
import type { PaymentTicket } from '@/types/ticket'

/**
 * « Télécharger le ticket » : impression / PDF, nommé d’après le numéro.
 */
function downloadReceipt(ticket: PaymentTicket) {
  const previous = document.title
  document.title = `Ticket-${ticket.number}`
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}

function TicketView({
  ticket,
  autoDownload = false,
}: {
  ticket: PaymentTicket
  autoDownload?: boolean
}) {
  const navigate = useNavigate()
  const pro = useTicketPro(ticket)

  useEffect(() => {
    if (!autoDownload) return
    const timer = window.setTimeout(() => downloadReceipt(ticket), 450)
    return () => window.clearTimeout(timer)
  }, [autoDownload, ticket])

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#eef3f0_0%,#f7f8f7_40%,#f3f5f4_100%)]">
      <header className="bg-brand text-brand-foreground">
        <div className="flex h-(--header-height) items-center gap-2 px-3">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => {
              if (window.history.length > 1) navigate(-1)
              else navigate(paths.tickets)
            }}
            className="grid size-10 place-items-center rounded-full bg-brand-foreground/15"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[15px] font-extrabold">
            Ticket de paiement
          </p>
          <span className="w-10" aria-hidden="true" />
        </div>
      </header>

      <div className="space-y-4 px-4 py-5 pb-10">
        <TicketCard ticket={ticket} pro={pro} printable />

        <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 rounded-xl border-brand/40 bg-white font-bold text-brand shadow-sm hover:bg-brand/8 hover:text-brand"
            onClick={() => downloadReceipt(ticket)}
          >
            <Download aria-hidden="true" />
            Télécharger
          </Button>
          <Link
            to={paths.home}
            className={buttonVariants({
              size: 'lg',
              className: 'h-12 rounded-xl font-bold shadow-sm',
            })}
          >
            <Home aria-hidden="true" />
            Accueil
          </Link>
        </div>

        <p className="text-center text-[11px] font-medium text-muted-foreground">
          Votre commerce, plus accessible avec AfriConnect
        </p>
      </div>
    </div>
  )
}

/** Détail d'un ticket : justificatif aux couleurs brand + actions. */
export function TicketDetailPage() {
  const { ticketId } = useParams()
  const [params] = useSearchParams()
  const ticket = useTicket(ticketId)
  const autoDownload = params.get('telecharger') === '1'

  if (!ticket) {
    return (
      <div className="space-y-4 px-4 py-6">
        <EmptyState
          icon={Ticket}
          title="Ticket introuvable"
          description="Ce ticket n’existe pas ou n’est pas associé à votre compte."
          action={
            <Link to={paths.tickets} className={buttonVariants()}>
              Mes tickets
            </Link>
          }
          className="py-20"
        />
      </div>
    )
  }

  return <TicketView ticket={ticket} autoDownload={autoDownload} />
}
