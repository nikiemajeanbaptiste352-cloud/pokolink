import { CircleCheck, Info, ShoppingBasket, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { buttonVariants } from '@/components/ui/button'
import {
  WalletPaymentForm,
  type WalletPaymentResult,
} from '@/components/wallet/WalletPaymentForm'
import { useCart } from '@/hooks/use-cart'
import { useProfile } from '@/hooks/use-profile'
import { usePublicPro } from '@/hooks/use-public-pro'
import {
  applyAffiliateSale,
  recordAffiliateClick,
} from '@/lib/affiliate-store'
import { itemReference } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'
import { settleMerchantCreditAfterPayment } from '@/lib/merchant-credit-payment'
import { splitName } from '@/lib/payment-labels'
import { addPurchase } from '@/lib/purchases-store'
import { getWalletPayments } from '@/lib/wallet-payments-store'
import { paths } from '@/routes/paths'
import type { PurchaseBuyer } from '@/types/purchase'

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

/**
 * Caisse : un seul écran — nom, prénom, ID, montant, confirmer.
 */
export function CheckoutPage() {
  const { serviceId } = useParams()
  const [searchParams] = useSearchParams()
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const pro = usePublicPro(serviceId)
  const cart = useCart(pro?.items ?? [], serviceId)
  const [done, setDone] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const affParam = searchParams.get('aff') ?? searchParams.get('ref')

  useEffect(() => {
    if (!affParam) return
    recordAffiliateClick(affParam)
  }, [affParam])

  const back = paths.cart

  if (!pro) {
    return (
      <>
        <PageHeader
          title="Commande"
          leading={<BackLink to={back} label="Panier" history />}
        />
        <ServiceNotFound backTo={back} />
      </>
    )
  }

  const { service } = pro

  if (!done && (pro.owned || cart.lines.length === 0)) {
    return (
      <>
        <PageHeader
          title="Commande"
          leading={<BackLink to={back} label="Panier" history />}
        />
        <EmptyState
          icon={ShoppingBasket}
          tone="gold"
          title={pro.owned ? 'Votre propre établissement' : 'Votre panier est vide'}
          description={
            pro.owned
              ? 'Vous ne pouvez pas acheter dans votre propre établissement.'
              : `Ajoutez des articles de ${service.name} pour passer commande.`
          }
          action={
            <Link to={paths.establishment(service.username)} className={buttonVariants()}>
              Voir la boutique
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const singleLine = cart.lines.length === 1 ? cart.lines[0] : undefined
  const paymentDetail = cart.lines
    .map(
      ({ item, quantity }) => `${item.name} × ${quantity} · ${formatPrice(item.price)}`,
    )
    .join(' · ')

  function sent(
    walletPaymentId: string,
    issuedTicketId: string,
    result?: WalletPaymentResult,
  ) {
    if (purchaseId) return
    const payment = getWalletPayments().find(
      (p) => p.id === walletPaymentId,
    )
    const paymentPhone = payment?.payerPhone
    const buyer: PurchaseBuyer = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userId: profile.handle,
      ...(paymentPhone || profile.phone ? { phone: paymentPhone || profile.phone } : {}),
    }
    const total = cart.total
    const paidAmount = result?.paidAmount ?? total
    const creditAmount = result?.creditAmount ?? 0
    const now = timestamp()
    const created = addPurchase(
      {
        serviceId: service.id,
        proRef: service.username,
        sellerName: service.name,
        ...(service.logo ? { sellerLogo: service.logo } : {}),
        lines: cart.lines.map(({ item, quantity }) => ({
          itemId: item.id,
          name: item.name,
          quantity,
          unitPrice: item.price,
        })),
        total,
        paidAmount,
        ...(creditAmount > 0
          ? { creditAmount, remainingDue: creditAmount }
          : {}),
        buyer,
        note: '',
        walletPaymentId,
      },
      now,
    )
    const saleRef = payment?.provisionalReference ?? created.reference
    settleMerchantCreditAfterPayment(
      {
        serviceId: service.id,
        sellerName: service.name,
        ...(service.logo ? { sellerLogo: service.logo } : {}),
        proRef: service.username,
        clientHandle: profile.handle,
        clientName: `${firstName.trim()} ${lastName.trim()}`,
        creditAmount,
        debtRepayment: result?.debtRepayment ?? 0,
        saleReference: saleRef,
        repaymentReference: `${saleRef}-RMB`,
        purchaseId: created.id,
        ticketId: issuedTicketId,
      },
      now,
    )
    // Commission sur la vente initiale (pas sur les remboursements de dette).
    applyAffiliateSale(service.id, total, now)
    setPurchaseId(created.id)
    setTicketId(issuedTicketId)
    cart.clear()
    setDone(true)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <PageHeader
        title={done ? 'Confirmé' : 'Payer'}
        leading={
          <BackLink
            to={done ? paths.purchases : back}
            label={done ? 'Mes achats' : 'Panier'}
            history
          />
        }
      />

      <div className="page-body space-y-4 pb-8">
        {done ? (
          <section aria-label="Paiement confirmé" className="space-y-4 px-4">
            <div className="space-y-2 rounded-2xl bg-info/10 p-4" role="status">
              <p className="flex items-center gap-2 text-title font-extrabold">
                <CircleCheck className="size-6 shrink-0 text-info" aria-hidden="true" />
                Paiement confirmé — ticket généré
              </p>
              <p className="text-body">
                Votre ticket (QR) est prêt pour {service.name}.
              </p>
            </div>
            <div className="grid gap-2">
              {ticketId ? (
                <Link
                  to={paths.ticket(ticketId)}
                  className={buttonVariants({ size: 'lg' })}
                >
                  <Ticket aria-hidden="true" />
                  Voir mon ticket
                </Link>
              ) : null}
              {purchaseId ? (
                <Link
                  to={paths.purchase(purchaseId)}
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  Suivre ma commande
                </Link>
              ) : null}
              <Link
                to={paths.establishment(service.username)}
                className={buttonVariants({ variant: 'ghost', size: 'lg' })}
              >
                Retour à {service.name}
              </Link>
            </div>
            <p className="flex items-start gap-2 text-caption text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Retrouvez aussi le ticket dans Profil → Tickets.
            </p>
          </section>
        ) : (
          <section
            aria-label="Paiement sécurisé"
            className="bg-[#f3f2f7] px-4 py-3"
          >
            <WalletPaymentForm
              purpose="purchase"
              title={singleLine ? singleLine.item.name : `Achat chez ${service.name}`}
              detail={paymentDetail}
              recipient={`@${service.username}`}
              beneficiary={{
                name: service.name,
                handle: service.username,
                business: service.name,
                serviceId: service.id,
                verified: pro.verified,
                ...(service.logo ? { avatarSrc: service.logo } : {}),
              }}
              payer={{ firstName, lastName }}
              editCartTo={paths.cart}
              orderLines={cart.lines.map(({ item, quantity }) => ({
                id: item.id,
                name: item.name,
                sellerName: service.name,
                reference: itemReference(item),
                quantity,
                unitPrice: item.price,
                allowMerchantCredit:
                  service.allowMerchantCredit === true &&
                  (item.allowMerchantCredit ?? false),
                ...(item.image ? { imageSrc: item.image } : {}),
              }))}
              quantity={singleLine ? singleLine.quantity : cart.count}
              {...(singleLine ? { unitPrice: singleLine.item.price } : {})}
              amount={cart.total}
              {...(singleLine
                ? {
                    itemReference: itemReference(singleLine.item),
                    ...(singleLine.item.image
                      ? { itemImageSrc: singleLine.item.image }
                      : {}),
                  }
                : {})}
              waitingLabel="Confirmer"
              actionLabel="Confirmer le paiement"
              enableMerchantCredit={service.allowMerchantCredit === true}
              onSent={sent}
            />
          </section>
        )}
      </div>
    </>
  )
}
