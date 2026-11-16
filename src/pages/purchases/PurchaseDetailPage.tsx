import { Check, ShoppingBag, Ticket, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusPill } from '@/components/pro/shared'
import { ReceiptCard } from '@/components/receipts/ReceiptCard'
import { buttonVariants } from '@/components/ui/button'
import { usePurchases } from '@/hooks/use-purchases'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { PURCHASE_JOURNEY, PURCHASE_STATUS } from '@/lib/purchase-labels'
import { receiptForPurchase } from '@/lib/receipts'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { PurchaseStatus } from '@/types/purchase'

function Journey({ status }: { status: PurchaseStatus }) {
  const cancelled = status === 'cancelled'
  const current = cancelled ? 0 : PURCHASE_JOURNEY.findIndex((step) => step.id === status)
  return (
    <ol aria-label="Étapes de la commande" className="flex gap-1.5">
      {PURCHASE_JOURNEY.map((step, index) => {
        const done = index < current || (status === 'completed' && index === current)
        const active = index === current && !done
        const blocked = cancelled && index === 0
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                'h-1.5 w-full rounded-full',
                blocked ? 'bg-danger' : done || active ? 'bg-brand' : 'bg-muted',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[11px] leading-4 font-bold',
                active || blocked ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-3 text-brand" aria-hidden="true" />
              ) : blocked ? (
                <X className="size-3 text-danger" aria-hidden="true" />
              ) : null}
              <span className="truncate">{blocked ? 'Annulée' : step.label}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Détail d'un achat : état de la commande, articles, acheteur et vendeur. */
export function PurchaseDetailPage() {
  const { purchaseId } = useParams()
  const purchases = usePurchases()
  const purchase = purchases.find((item) => item.id === purchaseId)

  if (!purchase) {
    return (
      <>
        <PageHeader
          title="Commande"
          leading={<BackLink to={paths.purchases} label="Mes achats" history />}
        />
        <EmptyState
          icon={ShoppingBag}
          tone="gold"
          title="Commande introuvable"
          description="Cette commande n’existe pas ou n’est pas associée à votre compte."
          action={
            <Link to={paths.purchases} className={buttonVariants()}>
              Voir mes achats
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const status = PURCHASE_STATUS[purchase.status]
  const receipt = receiptForPurchase(purchase)

  return (
    <>
      <PageHeader
        title="Commande"
        leading={<BackLink to={paths.purchases} label="Mes achats" history />}
      />
      <div className="space-y-5 py-4 pb-8">
        <section aria-label="État de la commande" className="space-y-3 px-4">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-caption text-muted-foreground">
              Réf. {purchase.reference}
              {purchase.local ? ' (provisoire)' : ''} ·{' '}
              {formatDateTime(purchase.createdAt)}
            </p>
            <StatusPill>{status.label}</StatusPill>
          </div>
          <Journey status={purchase.status} />
          <p role="status" className="rounded-xl bg-info/10 p-3.5 text-body">
            {status.message}
          </p>
        </section>

        <section aria-label="Articles" className="space-y-2 px-4">
          <h2 className="text-title font-extrabold">Articles</h2>
          <ul className="divide-y rounded-2xl border bg-card px-4 shadow-card">
            {purchase.lines.map((line) => (
              <li
                key={line.itemId}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <span className="min-w-0 text-body">
                  <span className="font-semibold">{line.name}</span>
                  <span className="text-muted-foreground"> × {line.quantity}</span>
                </span>
                <span className="shrink-0 text-body font-semibold tabular-nums">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-3 py-3 text-title font-extrabold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(purchase.total)}</span>
            </li>
            {purchase.paidAmount !== undefined ? (
              <li className="flex items-baseline justify-between gap-3 py-2 text-body">
                <span className="text-muted-foreground">Payé (Wallet)</span>
                <span className="font-bold tabular-nums">
                  {formatPrice(purchase.paidAmount)}
                </span>
              </li>
            ) : null}
            {purchase.creditAmount && purchase.creditAmount > 0 ? (
              <li className="flex items-baseline justify-between gap-3 py-2 text-body">
                <span className="text-muted-foreground">Crédit commerçant</span>
                <span className="font-bold tabular-nums">
                  {formatPrice(purchase.creditAmount)}
                </span>
              </li>
            ) : null}
            {purchase.remainingDue && purchase.remainingDue > 0 ? (
              <li className="flex items-baseline justify-between gap-3 py-2 text-body text-amber-700">
                <span className="font-semibold">Restant dû</span>
                <span className="font-extrabold tabular-nums">
                  {formatPrice(purchase.remainingDue)}
                </span>
              </li>
            ) : null}
          </ul>
        </section>

        <section aria-label="Informations" className="space-y-2 px-4">
          <h2 className="text-title font-extrabold">Informations</h2>
          <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Vendeur</dt>
              <dd className="min-w-0 text-right text-body font-bold break-words">
                <Link
                  to={paths.establishment(purchase.proRef)}
                  className="underline underline-offset-2"
                >
                  {purchase.sellerName}
                </Link>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Acheteur</dt>
              <dd className="min-w-0 text-right text-body font-bold break-words">
                {purchase.buyer.firstName} {purchase.buyer.lastName}
                <span className="block text-caption font-normal text-muted-foreground">
                  @{purchase.buyer.userId}
                </span>
                {purchase.buyer.phone ? (
                  <span className="block text-caption font-normal text-muted-foreground">
                    {purchase.buyer.phone}
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Paiement</dt>
              <dd className="text-right text-body font-bold">Wallet AfriConnect</dd>
            </div>
            {purchase.note ? (
              <div className="space-y-1 py-3">
                <dt className="text-body text-muted-foreground">Votre message</dt>
                <dd className="text-body break-words">{purchase.note}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        {receipt ? (
          <section aria-label="Ticket ou justificatif" className="space-y-3 px-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-title font-extrabold">
                {receipt.kind === 'ticket' ? 'Ticket généré' : 'Justificatif généré'}
              </h2>
              <Link
                to={paths.receipt('achat', purchase.id)}
                className="inline-flex items-center gap-1 text-caption font-bold text-brand underline underline-offset-2"
              >
                <Ticket className="size-3.5" aria-hidden="true" />
                Plein écran
              </Link>
            </div>
            <p className="text-caption text-muted-foreground">
              Généré automatiquement après confirmation du paiement · logo de l’espace pro
              inclus.
            </p>
            <ReceiptCard receipt={receipt} />
          </section>
        ) : (
          <p className="mx-4 rounded-xl border bg-card p-3.5 text-body text-muted-foreground">
            {purchase.status === 'pending_payment'
              ? 'Dès que le serveur confirme le paiement, le ticket (avec le logo de l’espace pro) est généré automatiquement.'
              : 'Aucun justificatif pour cette commande (annulée ou non confirmée).'}
          </p>
        )}

        <div className="grid gap-2 px-4">
          <Link
            to={paths.wallet}
            className={buttonVariants({
              variant: 'outline',
              size: 'lg',
            })}
          >
            Voir mon Wallet
          </Link>
          <Link
            to={paths.history}
            className={buttonVariants({
              variant: 'ghost',
              size: 'lg',
            })}
          >
            Voir l’historique
          </Link>
        </div>
      </div>
    </>
  )
}
