import { OrderTotals } from '@/components/cart/OrderTotals'
import type { CartLine } from '@/hooks/use-cart'
import { itemReference } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'

interface CartSummaryProps {
  lines: readonly CartLine[]
  total: number
  /** Titre du récapitulatif (niveau h2). */
  title: string
}

/** Récapitulatif de la sélection : articles (référence, quantité, total) puis totaux. */
export function CartSummary({ lines, total, title }: CartSummaryProps) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  return (
    <section aria-labelledby="cart-summary-title" className="space-y-3">
      <h2 id="cart-summary-title" className="text-title font-bold">
        {title}
      </h2>
      {lines.length === 0 ? (
        <p className="text-body text-muted-foreground">Aucun article sélectionné.</p>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card px-4 py-3 shadow-card">
          <ul className="divide-y divide-dashed">
            {lines.map(({ item, quantity }) => (
              <li key={item.id} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="min-w-0 text-body">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted-foreground"> × {quantity}</span>
                  <span className="block text-caption text-muted-foreground tabular-nums">
                    {itemReference(item)} · {formatPrice(item.price)} l’unité
                  </span>
                </span>
                <span className="shrink-0 text-body font-semibold tabular-nums">
                  {formatPrice(item.price * quantity)}
                </span>
              </li>
            ))}
          </ul>
          <OrderTotals
            count={count}
            subtotal={total}
            discount={0}
            fees={null}
            total={total}
            className="border-t border-dashed"
          />
        </div>
      )}
    </section>
  )
}
