import { BookOpen, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useBuyerEduAccesses } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { useWalletBalances } from '@/hooks/use-wallet'
import {
  LEARN_EDU_DELIVERY_LABEL,
  LEARN_EDU_KIND_LABEL,
} from '@/lib/afrilearn-commerce-labels'
import { buyerHasAccess, findEduProduct } from '@/lib/afrilearn-commerce-store'
import { settleLearnEduPurchase } from '@/lib/afrilearn-wallet'
import { formatPrice } from '@/lib/format'
import { splitName } from '@/lib/payment-labels'
import { paths } from '@/routes/paths'

/** Page de paiement Wallet pour un produit éducatif AfriLearn. */
export function LearnEduCheckoutPage() {
  const { productId } = useParams()
  const product = findEduProduct(productId)
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const { available } = useWalletBalances()
  const { pathname } = useLocation()
  const accesses = useBuyerEduAccesses(profile.handle)
  const [done, setDone] = useState(false)

  const owned =
    product &&
    (buyerHasAccess(profile.handle, product.id) ||
      accesses.some((a) => a.productId === product.id))
  const isSeller =
    product &&
    product.sellerHandle.toLowerCase() ===
      profile.handle.replace(/^@/, '').toLowerCase()

  if (!product || product.status !== 'published') {
    return (
      <>
        <PageHeader
          title="Payer"
          leading={<BackLink to={paths.learnMarket} label="Marché" history />}
        />
        <EmptyState
          icon={BookOpen}
          title="Produit indisponible"
          action={
            <Link to={paths.learnMarket} className={buttonVariants()}>
              Marché éducatif
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  if (isSeller) {
    return (
      <>
        <PageHeader
          title="Payer"
          leading={
            <BackLink
              to={paths.learnEduProduct(product.id)}
              label="Produit"
              history
            />
          }
        />
        <EmptyState
          icon={BookOpen}
          title="Votre propre produit"
          description="Vous ne pouvez pas acheter votre propre offre."
          action={
            <Link to={paths.learnEduProducts} className={buttonVariants()}>
              Mes produits
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  if (owned) {
    return (
      <>
        <PageHeader
          title="Déjà acheté"
          leading={
            <BackLink
              to={paths.learnEduProduct(product.id)}
              label="Produit"
              history
            />
          }
        />
        <div className="space-y-3 px-4 py-8">
          <p className="font-semibold text-brand">Accès déjà accordé.</p>
          <Link
            to={paths.learnEduProduct(product.id)}
            className={buttonVariants({ className: 'w-full' })}
          >
            Voir le produit / contenu
          </Link>
        </div>
      </>
    )
  }

  const shortfall = Math.max(0, product.price - available)

  function onSent(walletPaymentId: string, ticketId: string) {
    if (done) return
    settleLearnEduPurchase({
      walletPaymentId,
      ticketId,
      productId: product!.id,
      buyerHandle: profile.handle,
      buyerName: profile.name,
    })
    setDone(true)
  }

  return (
    <>
      <PageHeader
        title="Payer avec le Wallet"
        leading={
          <BackLink
            to={paths.learnEduProduct(product.id)}
            label="Produit"
            history
          />
        }
      />
      <div className="space-y-4 px-4 pb-10">
        <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Produit</dt>
            <dd className="max-w-[60%] text-right font-extrabold">{product.name}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-bold">{LEARN_EDU_KIND_LABEL[product.kind]}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Accès</dt>
            <dd className="font-bold">
              {LEARN_EDU_DELIVERY_LABEL[product.delivery]}
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Vendeur</dt>
            <dd className="font-bold">@{product.sellerHandle}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Montant</dt>
            <dd className="text-title font-extrabold tabular-nums text-brand">
              {formatPrice(product.price)}
            </dd>
          </div>
        </dl>

        <section className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Wallet AfriConnect
            </p>
            <p className="font-extrabold tabular-nums">{formatPrice(available)}</p>
          </div>
          {shortfall > 0 ? (
            <Link
              to={`${paths.walletDeposit()}?retour=${encodeURIComponent(pathname)}`}
              className="text-[12px] font-bold text-brand"
            >
              Approvisionner
            </Link>
          ) : null}
        </section>

        {shortfall > 0 ? (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-caption text-amber-800">
            Solde insuffisant : il manque {formatPrice(shortfall)}.
          </p>
        ) : null}

        <div className="rounded-[1.25rem] bg-[#f3f2f7] p-2">
          <WalletPaymentForm
            purpose="purchase"
            domain="afrilearn"
            title={product.name}
            detail={`AfriLearn · @${product.sellerHandle}`}
            amount={product.price}
            fees={0}
            enableRewards={false}
            enableMerchantCredit={false}
            payer={{ firstName, lastName }}
            beneficiary={{
              name: product.sellerName,
              handle: product.sellerHandle,
              business: `AfriLearn · ${product.sellerName}`,
              serviceId: `learn-edu-${product.sellerHandle}`,
            }}
            orderLines={[
              {
                id: product.id,
                name: product.name,
                sellerName: product.sellerName,
                quantity: 1,
                unitPrice: product.price,
                allowMerchantCredit: false,
              },
            ]}
            waitingLabel="Confirmer"
            actionLabel="Payer avec le Wallet"
            successTo={paths.learnEduProduct(product.id)}
            onSent={onSent}
          />
        </div>
      </div>
    </>
  )
}
