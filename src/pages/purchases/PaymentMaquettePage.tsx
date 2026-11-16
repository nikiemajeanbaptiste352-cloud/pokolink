import { Link, useNavigate } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useProfile } from '@/hooks/use-profile'
import {
  DEMO_PAYMENT_ORDER_LINES,
  DEMO_PAYMENT_SUBTOTAL,
} from '@/lib/demo-payment-order'
import { splitName } from '@/lib/payment-labels'
import { paths } from '@/routes/paths'

/**
 * Maquette interactive du formulaire de paiement (Wallet FCFA + Rewards).
 * Données de démo fixes : 3 articles · 30 000 FCFA · 2 500 pts · Wallet 40 000.
 * Hors navigation principale — accessible depuis le panier.
 */
export function PaymentMaquettePage() {
  const navigate = useNavigate()
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)

  return (
    <>
      <PageHeader
        title="Paiement"
        leading={<BackLink to={paths.cart} label="Panier" history />}
      />
      <div className="bg-[#f3f2f7] py-3">
        <section aria-label="Paiement" className="px-4">
          <WalletPaymentForm
            purpose="purchase"
            title="Commande multi-vendeurs"
            detail="Sac artisanal · Baskets sport · Écouteurs Bluetooth"
            amount={DEMO_PAYMENT_SUBTOTAL}
            orderLines={DEMO_PAYMENT_ORDER_LINES}
            payer={{ firstName, lastName }}
            editCartTo={paths.cart}
            beneficiary={{
              name: 'AfriConnect',
              handle: 'africonnect',
              business: 'AfriConnect Market',
              serviceId: 'africonnect-market',
              verified: true,
            }}
            waitingLabel="Confirmer"
            actionLabel="Confirmer le paiement"
            sentTitle="Paiement confirmé"
            onSent={(_requestId, ticketId) => {
              navigate(paths.ticket(ticketId))
            }}
          />
          <p className="text-center text-caption text-muted-foreground">
            Parcours réel panier →{' '}
            <Link to={paths.cart} className="font-bold underline underline-offset-2">
              Mon panier
            </Link>
          </p>
        </section>
      </div>
    </>
  )
}
