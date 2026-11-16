import {
  CalendarDays,
  Crown,
  HandCoins,
  Megaphone,
  Send,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

import { StatusPill } from '@/components/wallet/StatusCard'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { StatusMeta } from '@/lib/wallet-labels'
import type { WalletPaymentPurpose, WalletPaymentRequest } from '@/types/wallet'

/** Tant que le serveur n'a pas répondu, la demande est « en attente » (jamais « payée »). */
const PENDING: StatusMeta = {
  label: 'En attente de confirmation',
  outcome: 'progress',
  reached: 0,
  message:
    'Demande envoyée. Le serveur vérifie votre solde et débite votre Wallet : rien n’est encore payé.',
}

const PURPOSE_ICON: Record<WalletPaymentPurpose, LucideIcon> = {
  position: ShoppingBag,
  coins: ShoppingBag,
  subscription: Crown,
  advertising: Megaphone,
  purchase: ShoppingBag,
  event: CalendarDays,
  p2p_send: Send,
  p2p_request: HandCoins,
}

/**
 * Demande de paiement intra-Wallet : montant + références utiles au crédit
 * (bénéficiaire, téléphone acheteur).
 */
export function PaymentRequestRow({ request }: { request: WalletPaymentRequest }) {
  const Icon = PURPOSE_ICON[request.purpose]
  const payerLabel = request.payerHandle
    ? `@${request.payerHandle}`
    : request.payerName
  const sellerLabel = request.beneficiaryHandle
    ? `@${request.beneficiaryHandle}`
    : request.recipient
      ? request.recipient.startsWith('@')
        ? request.recipient
        : request.recipient
      : request.beneficiaryName
  const transferLabel =
    payerLabel && sellerLabel
      ? `${payerLabel} → ${sellerLabel}`
      : sellerLabel
        ? `→ ${sellerLabel}`
        : payerLabel
  const creditParts = [
    request.provisionalReference,
    transferLabel,
    request.beneficiaryServiceId
      ? `service ${request.beneficiaryServiceId}`
      : undefined,
    request.payerPhone ? `tél. ${request.payerPhone}` : undefined,
  ].filter(Boolean)

  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-3">
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-2xl',
          toneSoft.info,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{request.title}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {formatDateTime(request.createdAt)}
          {request.detail ? ` · ${request.detail}` : ''}
        </span>
        {creditParts.length > 0 ? (
          <span className="block truncate text-caption text-muted-foreground">
            {creditParts.join(' · ')}
          </span>
        ) : null}
        <StatusPill meta={PENDING} className="mt-1" />
      </span>
      <span className="shrink-0 text-body font-extrabold tabular-nums">
        {formatPrice(request.amount)}
      </span>
    </div>
  )
}
