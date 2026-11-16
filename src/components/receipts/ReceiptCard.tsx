import { BadgeCheck, CircleCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Avatar } from '@/components/common/Avatar'
import { formatPrice } from '@/lib/format'
import type { ReceiptData } from '@/lib/receipts'
import { formatTicketDate, formatTicketTime } from '@/lib/ticket-labels'
import { cn } from '@/lib/utils'

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-sm text-[#4b5b52]">{label}</dt>
      <dd className={cn('min-w-0 text-right text-sm break-words', strong && 'font-bold')}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Justificatif de paiement ou ticket. Affiche en tête le logo / la photo de profil de
 * l'espace pro. Seul le ticket porte un QR code et un statut de validation.
 */
export function ReceiptCard({ receipt }: { receipt: ReceiptData }) {
  const isTicket = receipt.kind === 'ticket'
  return (
    <figure
      data-print-ticket=""
      className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border bg-white text-[#111814] shadow-card"
    >
      <figcaption className="sr-only">
        {isTicket ? 'Ticket' : 'Justificatif de paiement'} {receipt.transactionNumber}
      </figcaption>

      <div className="flex items-center justify-between gap-3 bg-[#0b6b3a] px-5 py-4 text-white">
        <span className="text-xl font-extrabold tracking-tight">AfriConnect</span>
        <span className="text-sm font-bold">
          {isTicket ? 'Ticket' : 'Justificatif de paiement'}
        </span>
      </div>

      <div className="flex items-center gap-2 bg-[#e8f5ec] px-5 py-3 text-base font-extrabold text-[#0b6b3a]">
        <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
        Paiement {receipt.paymentStatus.toLowerCase()}
      </div>

      <div className="space-y-4 px-5 pt-4 pb-5">
        {/* Prestataire : logo ou photo de profil de l'espace pro */}
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#c3cec7] bg-[#f7faf8] px-4 py-4 text-center">
          <Avatar
            name={receipt.provider.name}
            src={receipt.provider.avatarSrc}
            size="2xl"
            className="rounded-2xl"
          />
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center justify-center gap-1.5 text-base font-extrabold break-words">
              <span className="min-w-0">{receipt.provider.name}</span>
              <BadgeCheck
                className="size-4.5 shrink-0 text-[#0b6b3a]"
                aria-label="Espace pro"
              />
            </p>
            {receipt.provider.handle ? (
              <p className="text-sm text-[#4b5b52]">@{receipt.provider.handle}</p>
            ) : null}
            <p className="mt-1 text-[11px] font-semibold tracking-wide text-[#4b5b52] uppercase">
              Espace Pro · bénéficiaire
            </p>
          </div>
        </div>

        <dl className="divide-y divide-dashed divide-[#c3cec7] border-y border-dashed border-[#c3cec7]">
          <Row label="N° de transaction" value={receipt.transactionNumber} strong />
          {receipt.ticketNumber ? (
            <Row label="N° de ticket" value={receipt.ticketNumber} strong />
          ) : null}
          <Row
            label="Client"
            value={`${receipt.payer.firstName} ${receipt.payer.lastName}`.trim()}
          />
          {receipt.payer.handle ? (
            <Row label="Identifiant client" value={`@${receipt.payer.handle}`} />
          ) : null}
          {receipt.beneficiaryHandle ? (
            <Row
              label="Identifiant bénéficiaire"
              value={`@${receipt.beneficiaryHandle}`}
            />
          ) : null}
          <Row label="Nature" value={receipt.nature} />
          <Row label="Désignation" value={receipt.designation} />
          <Row label="Montant payé" value={formatPrice(receipt.amount)} strong />
          {receipt.commission !== undefined ? (
            <Row label="Commission AfriConnect" value={formatPrice(receipt.commission)} />
          ) : null}
          <Row label="Date" value={formatTicketDate(receipt.at)} />
          <Row label="Heure" value={formatTicketTime(receipt.at)} />
          <Row label="Réf. Wallet" value={receipt.walletReference} />
          <Row label="Paiement" value={receipt.paymentStatus.toUpperCase()} strong />
          {receipt.ticketStatus ? (
            <Row
              label="Statut du ticket"
              value={receipt.ticketStatus.toUpperCase()}
              strong
            />
          ) : null}
        </dl>

        {isTicket && receipt.qrValue ? (
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG value={receipt.qrValue} size={132} marginSize={0} />
            <p className="text-center text-xs text-[#4b5b52]">
              Présentez ce QR code au prestataire : il le vérifie auprès du serveur avant
              de valider l’opération.
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-[#f1f5f2] p-3 text-center text-xs text-[#4b5b52]">
            Simple justificatif de paiement : aucune validation physique n’est nécessaire.
          </p>
        )}
      </div>
    </figure>
  )
}
