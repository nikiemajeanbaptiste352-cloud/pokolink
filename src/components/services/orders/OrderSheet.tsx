import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import {
  formatAgo,
  getPaymentLabel,
  ORDER_MODE_LABEL,
  ORDER_STATUS,
  ORDER_STEPS,
} from '@/lib/orders'
import { setOrderStatus } from '@/lib/order-status-store'
import { PAYMENT_METHODS } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import type { OrderStatus, ServiceOrder } from '@/types/order'

import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderSheetProps {
  order: ServiceOrder | null
  now: number
  onClose: () => void
}

/** Prochaine étape d'une commande : libellé du bouton et statut obtenu. */
const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending: { label: 'Accepter la commande', next: 'preparing' },
  preparing: { label: 'Marquer comme prête', next: 'ready' },
  ready: { label: 'Marquer comme terminée', next: 'completed' },
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="text-right text-body font-semibold">{value}</dd>
    </div>
  )
}

/**
 * Détail d'une commande, en feuille ancrée en bas de l'écran.
 * Les actions de suivi changent le statut sur cet appareil ; le serveur Commandes les validera.
 */
export function OrderSheet({ order, now, onClose }: OrderSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = order !== null

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const paymentLabel = order
    ? (PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)?.label ??
      order.paymentMethod)
    : ''
  const currentStep = order ? ORDER_STEPS.indexOf(order.status) : -1
  const nextAction = order ? NEXT_ACTION[order.status] : undefined

  return (
    <dialog
      ref={ref}
      aria-labelledby="order-sheet-title"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') ref.current?.close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close()
      }}
      className={cn(
        'fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[92dvh] w-full max-w-180 overflow-y-auto',
        'rounded-t-3xl bg-background p-0 text-foreground backdrop:bg-black/60',
      )}
    >
      {order ? (
        <div className="pb-safe space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <h2 id="order-sheet-title" className="text-title font-extrabold">
                Commande {order.reference}
              </h2>
              <p className="text-body text-muted-foreground">
                {formatAgo(order.createdAt, now)} · {ORDER_MODE_LABEL[order.mode]}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Fermer"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {order.status === 'cancelled' ? null : (
            <ol aria-label="Avancement de la commande" className="grid grid-cols-4 gap-1">
              {ORDER_STEPS.map((step, index) => {
                const done = index <= currentStep
                return (
                  <li
                    key={step}
                    aria-current={index === currentStep ? 'step' : undefined}
                    className="space-y-1.5 text-center"
                  >
                    <span
                      className={cn(
                        'mx-auto grid size-7 place-items-center rounded-full text-caption font-bold',
                        done
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        'block text-caption',
                        index === currentStep ? 'font-bold' : 'text-muted-foreground',
                      )}
                    >
                      {ORDER_STATUS[step].label}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}

          <section aria-label="Articles" className="space-y-2">
            <ul className="divide-y rounded-xl border bg-card px-4 shadow-card">
              {order.lines.map((line) => (
                <li
                  key={line.itemId}
                  className="flex items-baseline justify-between gap-3 py-3"
                >
                  <span className="min-w-0 text-body">
                    <span className="font-semibold">{line.name}</span>
                    <span className="text-muted-foreground"> × {line.quantity}</span>
                  </span>
                  <span className="shrink-0 text-body font-semibold">
                    {formatPrice(line.unitPrice * line.quantity)}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-3 py-3 text-title font-extrabold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </li>
            </ul>
          </section>

          <dl className="space-y-2 rounded-xl border bg-card p-3.5">
            <Row label="Client" value={order.customerName} />
            <Row label="Téléphone" value={order.customerPhone} />
            <Row label="Paiement" value={paymentLabel} />
            <Row label="État du paiement" value={getPaymentLabel(order)} />
          </dl>

          {order.note ? (
            <p className="rounded-xl bg-muted p-3.5 text-body">
              <span className="font-bold">Message du client : </span>
              {order.note}
            </p>
          ) : null}

          {nextAction ? (
            <div className="grid gap-2">
              <Button
                type="button"
                size="lg"
                onClick={() => order && setOrderStatus(order.id, nextAction.next)}
              >
                {nextAction.label}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => order && setOrderStatus(order.id, 'cancelled')}
              >
                Refuser ou annuler
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  )
}
