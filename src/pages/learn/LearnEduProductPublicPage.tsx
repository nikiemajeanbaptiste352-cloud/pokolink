import { BookOpen } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { useBuyerEduAccesses } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  LEARN_EDU_DELIVERY_LABEL,
  LEARN_EDU_KIND_LABEL,
} from '@/lib/afrilearn-commerce-labels'
import { buyerHasAccess, findEduProduct } from '@/lib/afrilearn-commerce-store'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

/** Fiche publique produit éducatif — achat via page paiement Wallet. */
export function LearnEduProductPublicPage() {
  const { productId } = useParams()
  const product = findEduProduct(productId)
  const profile = useProfile()
  const accesses = useBuyerEduAccesses(profile.handle)
  const [params] = useSearchParams()
  const justPaid = params.get('paye') === '1'
  const ticketId = params.get('ticket')

  const owned = product
    ? buyerHasAccess(profile.handle, product.id) ||
      accesses.some((a) => a.productId === product.id)
    : false
  const isSeller =
    product &&
    product.sellerHandle.toLowerCase() ===
      profile.handle.replace(/^@/, '').toLowerCase()

  if (!product || product.status !== 'published') {
    return (
      <>
        <PageHeader
          title="Produit"
          leading={<BackLink to={paths.learnMarket} label="Marché" history />}
        />
        <EmptyState
          icon={BookOpen}
          title="Produit indisponible"
          description="Cette offre n’est plus publiée."
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

  return (
    <>
      <PageHeader
        title={product.name}
        leading={<BackLink to={paths.learnMarket} label="Marché" history />}
      />
      <div className="space-y-4 px-4 pb-10">
        {justPaid ? (
          <p
            role="status"
            className="rounded-2xl border border-brand/30 bg-brand/5 px-3.5 py-3 text-[13px] font-semibold text-brand"
          >
            Paiement Wallet confirmé.
            {ticketId ? (
              <>
                {' '}
                <Link
                  to={paths.ticket(ticketId)}
                  className="underline underline-offset-2"
                >
                  Voir le ticket
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        <section className="space-y-2 rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-caption text-muted-foreground">
            {LEARN_EDU_KIND_LABEL[product.kind]} ·{' '}
            {LEARN_EDU_DELIVERY_LABEL[product.delivery]}
          </p>
          <p className="text-display font-extrabold tabular-nums text-brand">
            {formatPrice(product.price)}
          </p>
          <p className="text-body text-muted-foreground whitespace-pre-line">
            {product.description}
          </p>
          {product.preview ? (
            <p className="rounded-xl bg-muted p-3 text-caption">
              Aperçu : {product.preview}
            </p>
          ) : null}
          <p className="text-caption">
            Vendeur ·{' '}
            <Link
              to={paths.learnMember(product.sellerHandle)}
              className="font-bold text-brand underline underline-offset-2"
            >
              @{product.sellerHandle}
            </Link>{' '}
            · {product.sellerName}
          </p>
        </section>

        {owned && product.digitalContent ? (
          <section className="space-y-2 rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <h2 className="font-extrabold text-brand">Accès après paiement</h2>
            <p className="whitespace-pre-wrap text-body">{product.digitalContent}</p>
          </section>
        ) : null}

        {isSeller ? (
          <p className="text-caption text-muted-foreground">
            C’est votre produit —{' '}
            <Link to={paths.learnEduProducts} className="font-bold text-brand">
              gérer dans Mon AfriLearn
            </Link>
            .
          </p>
        ) : owned ? (
          <p className="font-semibold text-brand">Vous avez déjà acheté ce produit.</p>
        ) : (
          <Link
            to={paths.learnEduCheckout(product.id)}
            className={buttonVariants({ size: 'lg', className: 'w-full' })}
          >
            Acheter · Wallet AfriConnect
          </Link>
        )}
      </div>
    </>
  )
}
