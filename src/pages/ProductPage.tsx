import {
  CircleCheck,
  CircleX,
  MapPin,
  MessageCircle,
  Settings,
  ShoppingBag,
  ShoppingBasket,
  Star,
  Store,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { PageHeader } from '@/components/common/PageHeader'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { Button, buttonVariants } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import { usePublicProduct } from '@/hooks/use-public-pro'
import { recordAffiliateClick } from '@/lib/affiliate-store'
import { addToCart } from '@/lib/cart-store'
import { getMaxQuantity, getStockLabel, isOrderable } from '@/lib/catalog'
import { getDiscountPercent } from '@/lib/events'
import { formatCount, formatPrice, formatRating } from '@/lib/format'
import { productContext, proProfilePath, proRecipient } from '@/lib/messaging-contexts'
import { accentStyle } from '@/lib/service-accents'
import { getServiceTypeMeta } from '@/lib/service-types'
import { paths } from '@/routes/paths'

/**
 * Fiche produit publique : ce que voit un client depuis Accueil ou Explorer. Elle défile
 * verticalement. Le vendeur (`professional_space_id` = `service.id`) est toujours relié :
 * sa pastille et sa carte ouvrent son profil public, « Message » ouvre la messagerie
 * centrale avec lui, « Commander » reprend le flux de commande existant du profil.
 *
 * Le prix promotionnel est celui annoncé par le vendeur : le montant réellement dû est
 * toujours confirmé par le serveur à la commande.
 */
export function ProductPage() {
  const { productId } = useParams()
  const found = usePublicProduct(productId)
  const startConversation = useStartConversation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [added, setAdded] = useState(false)
  const affParam = searchParams.get('aff')
  const payNow = searchParams.get('payer') === '1'
  const affiliateCheckoutDone = useRef(false)

  useEffect(() => {
    if (!affParam) return
    recordAffiliateClick(affParam)
  }, [affParam])

  // Lien affilié produit : panier + caisse immédiate.
  useEffect(() => {
    if (!payNow || !found || found.owned) return
    if (affiliateCheckoutDone.current) return
    const { item, service } = found
    if (!isOrderable(item)) return
    affiliateCheckoutDone.current = true
    addToCart(service.id, item.id, getMaxQuantity(item))
    const qs = affParam ? `?aff=${encodeURIComponent(affParam)}` : ''
    navigate(`${paths.checkout(service.id)}${qs}`, { replace: true })
  }, [payNow, found, affParam, navigate])

  if (!found) {
    return (
      <>
        <PageHeader
          title="Produit"
          leading={<BackLink to={paths.explore} label="Explorer" history />}
        />
        <EmptyState
          icon={ShoppingBag}
          title="Produit introuvable"
          description="Ce produit n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.explore} className={buttonVariants()}>
              Retour à Explorer
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const { item, service, owned, siblings, promoPrice, verified, rating } = found
  const meta = getServiceTypeMeta(service.type)
  const orderable = isOrderable(item)
  const StockIcon = orderable ? CircleCheck : CircleX
  const profile = proProfilePath(service)
  const place = [service.city, service.country].filter(Boolean).join(', ')
  const discount =
    promoPrice === undefined ? 0 : getDiscountPercent(item.price, promoPrice)

  return (
    <div className="service-scope" style={accentStyle(service.accent)}>
      <PageHeader
        title={item.name}
        leading={<BackLink to={paths.explore} label="Explorer" history />}
      />

      <article className="pb-6">
        <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-6 sm:px-4 sm:pt-4">
          <div className="relative overflow-hidden sm:sticky sm:top-[calc(var(--header-height)+1rem)] sm:rounded-3xl">
            <Media
              src={item.image || undefined}
              alt={item.name}
              icon={meta.icon}
              tone={meta.tone}
              className="aspect-square w-full"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/40 to-transparent"
            />
            <Link
              to={profile}
              aria-label={`Profil public de ${service.name}`}
              className="absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-background/90 py-1 pr-3 pl-1 shadow-sm backdrop-blur after:absolute after:-inset-1 after:content-['']"
            >
              <Avatar name={service.name} src={service.logo || undefined} size="md" />
              <span className="truncate text-body font-bold">{service.name}</span>
              {verified ? <VerifiedBadge /> : null}
            </Link>
            {discount > 0 ? (
              <span className="absolute right-3 bottom-3 rounded-full bg-destructive px-3 py-1 text-body font-extrabold text-white shadow">
                -{discount} %
              </span>
            ) : null}
          </div>

          <div className="space-y-6 px-4 pt-5 sm:px-0 sm:pt-0">
            <header className="space-y-3">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-caption font-bold text-secondary-foreground">
                {item.category}
              </span>
              <h2 className="text-headline font-extrabold">{item.name}</h2>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-3xl font-extrabold text-brand">
                    {formatPrice(promoPrice ?? item.price)}
                  </span>
                  {promoPrice !== undefined ? (
                    <span className="text-title text-muted-foreground line-through">
                      {formatPrice(item.price)}
                    </span>
                  ) : null}
                </p>
                {promoPrice !== undefined ? (
                  <p className="text-caption text-muted-foreground">
                    Prix promotionnel annoncé par le vendeur. Le montant final est
                    confirmé à la commande.
                  </p>
                ) : null}
              </div>
              <p
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body font-semibold ${
                  orderable ? 'bg-success/15' : 'bg-destructive/10 text-danger'
                }`}
              >
                <StockIcon className="size-5" aria-hidden="true" />
                {getStockLabel(item)}
              </p>
            </header>

            <section aria-labelledby="seller-title" className="space-y-2">
              <h3 id="seller-title" className="text-title font-bold">
                Vendeur
              </h3>
              <Link
                to={profile}
                className="block space-y-3 rounded-2xl border bg-card p-3.5 shadow-card transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <Avatar name={service.name} src={service.logo || undefined} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-body font-bold">
                      <span className="truncate">{service.name}</span>
                      {verified ? <VerifiedBadge /> : null}
                    </span>
                    {place ? (
                      <span className="flex items-center gap-1 text-caption text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{place}</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-body font-semibold text-brand">
                    Voir le profil
                  </span>
                </span>
                {rating !== null || found.followers > 0 ? (
                  <span className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-caption text-muted-foreground">
                    {rating !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star
                          className="size-3.5 fill-gold text-gold"
                          aria-hidden="true"
                        />
                        <strong className="text-foreground">
                          {formatRating(rating)}
                        </strong>
                        ({formatCount(found.reviewCount)} avis)
                      </span>
                    ) : null}
                    {found.followers > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden="true" />
                        <strong className="text-foreground">
                          {formatCount(found.followers)}
                        </strong>
                        abonnés
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </Link>
            </section>

            {service.allowMerchantCredit && item.allowMerchantCredit ? (
              <p className="rounded-xl border border-brand/30 bg-brand/5 px-3.5 py-2.5 text-caption font-semibold text-brand">
                Achat à crédit possible chez {service.name} (sur confirmation au
                paiement).
              </p>
            ) : null}

            <section aria-labelledby="item-description" className="space-y-2">
              <h3 id="item-description" className="text-title font-bold">
                Description
              </h3>
              <p className="text-body whitespace-pre-line text-muted-foreground">
                {item.description || 'Aucune description pour ce produit.'}
              </p>
            </section>

            {item.options.length > 0 ? (
              <section aria-labelledby="item-options" className="space-y-2">
                <h3 id="item-options" className="text-title font-bold">
                  Options
                </h3>
                <ul className="divide-y rounded-2xl border bg-card">
                  {item.options.map((option) => (
                    <li
                      key={option.name}
                      className="flex min-h-12 items-center justify-between gap-3 px-4 py-2"
                    >
                      <span className="text-body font-semibold">{option.name}</span>
                      <span className="text-body text-muted-foreground">
                        {option.extraPrice > 0
                          ? `+ ${formatPrice(option.extraPrice)}`
                          : 'Gratuit'}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {owned ? (
              <p className="rounded-xl bg-muted p-3 text-body text-muted-foreground">
                Ce produit est dans votre catalogue : vous le voyez comme un client.
              </p>
            ) : null}
          </div>
        </div>

        {siblings.length > 0 ? (
          <section aria-labelledby="item-related" className="mt-8 space-y-3">
            <h3 id="item-related" className="px-4 text-title font-bold">
              Autres produits de {service.name}
            </h3>
            <ul className="flex scrollbar-none gap-3 overflow-x-auto px-4 pb-2">
              {siblings.slice(0, 8).map((sibling) => (
                <li key={sibling.id} className="w-36 shrink-0 sm:w-40">
                  <Link
                    to={paths.product(sibling.id)}
                    className="block overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-md"
                  >
                    <Media
                      src={sibling.image || undefined}
                      alt=""
                      icon={meta.icon}
                      tone={meta.tone}
                      className="aspect-square w-full"
                    />
                    <span className="block space-y-0.5 p-2.5">
                      <span className="line-clamp-2 text-caption leading-tight font-semibold">
                        {sibling.name}
                      </span>
                      <span className="block text-body font-extrabold text-brand">
                        {formatPrice(sibling.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      {/* Actions toujours à portée de pouce, au-dessus de la barre de navigation. */}
      <div className="sticky bottom-0 z-10 flex flex-wrap gap-2 border-t bg-background/95 p-3 backdrop-blur md:bottom-0">
        {added && !owned ? (
          <p
            role="status"
            className="flex basis-full items-center justify-between gap-3 text-body"
          >
            <span className="font-semibold">Ajouté au panier.</span>
            <Link to={paths.cart} className="font-bold underline underline-offset-2">
              Voir le panier
            </Link>
          </p>
        ) : null}
        {owned ? (
          <Link
            to={paths.serviceItem(service.id, item.id)}
            className={buttonVariants({ size: 'lg', className: 'min-w-0 flex-1' })}
          >
            <Settings aria-hidden="true" />
            Gérer ce produit
          </Link>
        ) : (
          <>
            <Button
              type="button"
              size="lg"
              variant="outline"
              aria-label="Envoyer un message au vendeur"
              className="shrink-0 px-4 sm:px-6"
              onClick={() =>
                startConversation({
                  recipient: proRecipient(service),
                  professionalSpaceId: service.id,
                  context: productContext(item),
                })
              }
            >
              <MessageCircle aria-hidden="true" />
              <span className="hidden sm:inline">Message</span>
            </Button>
            <Link
              to={profile}
              aria-label="Voir la boutique"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className: 'shrink-0 px-4 sm:px-6',
              })}
            >
              <Store aria-hidden="true" />
              <span className="hidden sm:inline">Boutique</span>
            </Link>
            {orderable ? (
              <>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  aria-label="Ajouter au panier"
                  className="shrink-0 px-4"
                  onClick={() => {
                    addToCart(service.id, item.id, getMaxQuantity(item))
                    setAdded(true)
                  }}
                >
                  <ShoppingBasket aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="min-w-0 flex-1"
                  onClick={() => {
                    addToCart(service.id, item.id, getMaxQuantity(item))
                    navigate(paths.checkout(service.id))
                  }}
                >
                  <ShoppingBag aria-hidden="true" />
                  Acheter
                </Button>
              </>
            ) : (
              <Button size="lg" disabled className="min-w-0 flex-1">
                <ShoppingBag aria-hidden="true" />
                Indisponible
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
