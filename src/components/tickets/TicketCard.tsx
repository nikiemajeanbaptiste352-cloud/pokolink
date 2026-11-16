import {
  ArrowLeftRight,
  BadgeCheck,
  CircleCheck,
  CircleX,
  Gift,
  Handshake,
  Package,
  Ticket as TicketIcon,
  Wallet,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { Media } from '@/components/common/Media'
import { formatCount, formatPrice } from '@/lib/format'
import {
  formatTicketDate,
  formatTicketNumber,
  formatTicketTime,
  TICKET_STATUS,
} from '@/lib/ticket-labels'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { PaymentTicket } from '@/types/ticket'

export interface TicketPro {
  name: string
  logo?: string | undefined
  verified: boolean
  /** Domaine d'activité (ex. « Entretien automobile »). */
  domain: string
}

interface TicketCardProps {
  ticket: PaymentTicket
  pro: TicketPro
  /** Marque la carte comme la seule partie imprimée de la page (voir `globals.css`). */
  printable?: boolean
}

/** Adresse encodée dans le QR code : la vérification du ticket dans l'Espace Pro concerné. */
function qrValue(ticket: PaymentTicket): string {
  return `${window.location.origin}${paths.serviceScanner(ticket.serviceId, ticket.verificationCode)}`
}

function MetaCell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="text-[13px] font-bold leading-snug break-words">{children}</div>
    </div>
  )
}

/**
 * Ticket de paiement AfriConnect — justificatif imprimable.
 * Contenu inchangé ; mise en page type pass / reçu officiel.
 */
export function TicketCard({ ticket, pro, printable = false }: TicketCardProps) {
  const meta = TICKET_STATUS[ticket.status]
  const cancelled = ticket.status === 'cancelled'
  const awaiting = ticket.status === 'pending_validation' || ticket.status === 'paid'
  const original = ticket.originalAmount ?? ticket.amount
  const rewardsDiscount = ticket.rewardsDiscountFcfa ?? 0
  const rewardsPoints = ticket.rewardsPointsUsed ?? 0
  const quantity = ticket.quantity ?? 1

  return (
    <figure
      data-print-ticket={printable ? '' : undefined}
      className="ticket-card mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white text-[#111814] shadow-[0_12px_40px_-18px_rgba(11,107,58,0.35)] ring-1 ring-black/8"
    >
      <figcaption className="sr-only">
        Ticket de paiement {formatTicketNumber(ticket.number)}, {meta.label}
      </figcaption>

      {/* Bandeau marque */}
      <div className="relative bg-brand px-4 pt-4 pb-5 text-brand-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(135deg, transparent 40%, white 40%, white 42%, transparent 42%), linear-gradient(45deg, transparent 60%, white 60%, white 61%, transparent 61%)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-[12px] font-black tracking-tight ring-1 ring-white/25"
            >
              AC
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold tracking-tight">
                AfriConnect
              </p>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/75 uppercase">
                Paiement sécurisé
              </p>
            </div>
          </div>
          {!cancelled ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-white/25">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              Paiement réussi
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-extrabold text-destructive-foreground">
              <CircleX className="size-3.5" aria-hidden="true" />
              Annulé
            </span>
          )}
        </div>
      </div>

      {/* Perforation type billet */}
      <div aria-hidden="true" className="relative h-4 bg-white">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#c9d4cc]" />
        <span className="ticket-notch absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full bg-[#f3f5f4]" />
        <span className="ticket-notch absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full bg-[#f3f5f4]" />
      </div>

      <div className="space-y-5 bg-white px-4 pb-5">
        {/* Titre */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              'grid size-14 place-items-center rounded-full shadow-sm ring-4',
              cancelled
                ? 'bg-destructive/10 text-destructive ring-destructive/10'
                : 'bg-brand text-brand-foreground ring-brand/15',
            )}
          >
            {cancelled ? (
              <CircleX className="size-7" strokeWidth={2.25} aria-hidden="true" />
            ) : (
              <CircleCheck className="size-7" strokeWidth={2.25} aria-hidden="true" />
            )}
          </span>
          <div className="space-y-0.5">
            <h2 className="text-[1.25rem] font-black tracking-tight text-[#111814] uppercase">
              Ticket de paiement
            </h2>
            <p className="text-[12px] text-[#5a6b61]">
              Justificatif officiel de transaction
            </p>
          </div>
          {!cancelled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-[12px] font-extrabold text-brand">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              Paiement confirmé
            </span>
          ) : null}
        </div>

        {/* Bénéficiaire */}
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#f4f7f5] px-4 py-4 text-center ring-1 ring-[#e2eae5]">
          <Avatar name={pro.name} src={pro.logo ?? ticket.providerLogo} size="xl" />
          <p className="inline-flex max-w-full items-center justify-center gap-1.5 text-[16px] font-extrabold text-[#111814]">
            <span className="truncate">{pro.name}</span>
            {pro.verified ? (
              <BadgeCheck
                className="size-4.5 shrink-0 text-brand"
                aria-label="Vérifié"
              />
            ) : null}
          </p>
          <p className="text-[12px] text-[#5a6b61]">@{ticket.proRef}</p>
          {pro.verified ? (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand">
              Service Pro vérifié
            </span>
          ) : null}
        </div>

        {/* Références */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f4f7f5] px-3 py-3 ring-1 ring-[#e2eae5]">
            <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] text-[#5a6b61] uppercase">
              <TicketIcon className="size-3.5 text-brand" aria-hidden="true" />
              N° du ticket
            </p>
            <p className="font-mono text-[12px] font-extrabold break-all text-[#111814]">
              {ticket.number}
            </p>
          </div>
          <div className="rounded-xl bg-[#f4f7f5] px-3 py-3 ring-1 ring-[#e2eae5]">
            <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] text-[#5a6b61] uppercase">
              <ArrowLeftRight className="size-3.5 text-brand" aria-hidden="true" />
              Transaction
            </p>
            <p className="font-mono text-[12px] font-extrabold break-all text-[#111814]">
              {ticket.transactionRef}
            </p>
          </div>
        </div>

        {/* Article */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#e2eae5] bg-white p-3">
          <Media
            src={ticket.itemImageSrc}
            alt=""
            icon={Package}
            tone="neutral"
            className="size-14 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold text-[#111814]">
              {ticket.itemLabel}
            </p>
            {ticket.itemReference ? (
              <p className="text-[11px] text-[#5a6b61]">{ticket.itemReference}</p>
            ) : null}
            <p className="text-[11px] text-[#5a6b61]">Quantité : {quantity}</p>
          </div>
          <p className="shrink-0 text-[14px] font-extrabold text-brand tabular-nums">
            {formatPrice(original)}
          </p>
        </div>

        {/* Détail montants */}
        <dl className="space-y-2 border-y border-dashed border-[#d5ded8] py-3 text-[13px]">
          <div className="flex justify-between gap-2">
            <dt className="text-[#5a6b61]">Prix initial</dt>
            <dd className="font-bold tabular-nums text-[#111814]">
              {formatPrice(original)}
            </dd>
          </div>
          {rewardsDiscount > 0 ? (
            <div className="flex justify-between gap-2 text-[#0b6b3a]">
              <dt className="font-semibold">Réduction Rewards</dt>
              <dd className="font-extrabold tabular-nums">
                − {formatPrice(rewardsDiscount)}
              </dd>
            </div>
          ) : null}
          {rewardsPoints > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="inline-flex items-center gap-1 text-[#5a6b61]">
                <Gift className="size-3.5 text-gold" aria-hidden="true" />
                Points utilisés
              </dt>
              <dd className="font-bold tabular-nums text-[#111814]">
                {formatCount(rewardsPoints)} points
              </dd>
            </div>
          ) : null}
          {ticket.creditAmount && ticket.creditAmount > 0 ? (
            <div className="flex justify-between gap-2">
              <dt className="inline-flex items-center gap-1 text-[#5a6b61]">
                <Handshake className="size-3.5 text-brand" aria-hidden="true" />
                Crédit commerçant
              </dt>
              <dd className="font-bold tabular-nums text-[#111814]">
                {formatPrice(ticket.creditAmount)}
              </dd>
            </div>
          ) : null}
          {ticket.remainingDue && ticket.remainingDue > 0 ? (
            <div className="flex justify-between gap-2 text-amber-700">
              <dt className="font-semibold">Montant restant dû</dt>
              <dd className="font-extrabold tabular-nums">
                {formatPrice(ticket.remainingDue)}
              </dd>
            </div>
          ) : null}
          {ticket.paymentStatusLabel ? (
            <div className="flex justify-between gap-2">
              <dt className="text-[#5a6b61]">Statut du paiement</dt>
              <dd className="font-bold text-[#111814]">{ticket.paymentStatusLabel}</dd>
            </div>
          ) : null}
        </dl>

        {/* Total payé */}
        <div className="rounded-2xl bg-linear-to-br from-brand to-[#085530] px-4 py-4 text-brand-foreground shadow-sm">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-white/85 uppercase">
            <Wallet className="size-3.5" aria-hidden="true" />
            Montant effectivement payé
          </p>
          <p className="mt-1.5 text-[1.75rem] leading-none font-black tracking-tight tabular-nums">
            {formatPrice(ticket.amount)}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-white/80">
            Payé avec le Wallet AfriConnect
            {ticket.remainingDue && ticket.remainingDue > 0
              ? ` · reste dû ${formatPrice(ticket.remainingDue)}`
              : ''}
          </p>
        </div>

        {/* QR */}
        {cancelled ? (
          <p className="rounded-xl bg-destructive/10 p-3 text-center text-sm font-semibold text-destructive">
            Ticket annulé : ce QR code n’est plus valable.
          </p>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-[#e2eae5] bg-[#f8faf9] p-3">
            <div className="shrink-0 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-[#e2eae5]">
              <QRCodeSVG value={qrValue(ticket)} size={108} marginSize={0} />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-[13px] font-extrabold text-[#111814]">
                QR Code de validation
              </p>
              <p className="text-[11px] leading-snug text-[#5a6b61]">
                Présentez ce QR code au bénéficiaire pour faire valider le ticket.
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                <CircleCheck className="size-3" aria-hidden="true" />
                {awaiting ? 'Ticket en attente de validation' : meta.label}
              </span>
            </div>
          </div>
        )}

        {/* Pied */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl bg-[#f4f7f5] px-3.5 py-3.5 ring-1 ring-[#e2eae5]">
          <MetaCell label="Date">
            {formatTicketDate(ticket.paidAt)} · {formatTicketTime(ticket.paidAt)}
          </MetaCell>
          <MetaCell label="Mode de paiement">Wallet FCFA</MetaCell>
          <MetaCell label="Statut">
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                cancelled
                  ? 'bg-destructive/15 text-destructive'
                  : awaiting
                    ? 'bg-[#fff4d6] text-[#7a5200]'
                    : 'bg-brand/12 text-brand',
              )}
            >
              {meta.label}
            </span>
          </MetaCell>
          <p className="flex items-end gap-1.5 self-end text-[11px] font-semibold text-[#5a6b61]">
            <Handshake className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
            Merci d’utiliser AfriConnect
          </p>
        </div>
      </div>
    </figure>
  )
}
