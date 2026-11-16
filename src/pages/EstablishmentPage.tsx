import { MessageCircle, ShoppingBasket, Store } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { AffiliationTab } from '@/components/affiliate/AffiliateEstablishmentTab'
import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { ProHero } from '@/components/pro-public/ProHero'
import {
  CatalogueTab,
  EventsTab,
  HomeTab,
  PlansTab,
  PostsTab,
  ReviewsTab,
} from '@/components/pro-public/ProSections'
import { ContactTab, ProfileTab } from '@/components/pro-public/ProProfileSections'
import { ProTabs } from '@/components/pro-public/ProTabs'
import { DashboardWelcome } from '@/components/services/DashboardWelcome'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useStartConversation } from '@/hooks/use-conversations'
import { useNow } from '@/hooks/use-now'
import { usePublicPro } from '@/hooks/use-public-pro'
import { recordAffiliateClick } from '@/lib/affiliate-store'
import { isOrderable } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'
import { profileContext, proRecipient } from '@/lib/messaging-contexts'
import { countUpcomingEvents } from '@/lib/pro-public'
import { isProTabId, type ProTabId } from '@/lib/pro-tabs'
import { accentStyle } from '@/lib/service-accents'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CatalogItem } from '@/types/service'

const NO_ITEMS: CatalogItem[] = []

/**
 * Page publique d'un Service Pro — vitrine marketplace (Amazon Store / Alibaba) :
 * identité boutique, catalogue dense, événements, publications, avis, forfaits, contact.
 * Aucune fonction de gestion ici (sauf « Gérer mon Espace Pro » pour le propriétaire).
 *
 * La rubrique ouverte est dans l'adresse (`?onglet=catalogue`).
 */
export function EstablishmentPage() {
  // L'adresse publique utilise le nom d'utilisateur ; l'identifiant reste accepté.
  const { ref } = useParams()
  const pro = usePublicPro(ref)
  const cart = useCart(pro?.items ?? NO_ITEMS, pro?.service.id)
  const nowMs = useNow(60_000)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const startConversation = useStartConversation()
  const addedRef = useRef<string | null>(null)

  const tabParam = searchParams.get('onglet')
  // ?produit= (carte produit d'Explorer) ouvre le catalogue sur ce produit.
  const productParam = searchParams.get('produit')
  // ?evenement= ouvre l'onglet événements et la feuille de participation.
  const eventParam = searchParams.get('evenement')
  /** Lien d’affiliation personnel (?aff=AFF… ; ancien ?ref= encore accepté). */
  const affParam = searchParams.get('aff') ?? searchParams.get('ref')
  const tab: ProTabId = isProTabId(tabParam)
    ? tabParam
    : productParam
      ? 'catalogue'
      : eventParam
        ? 'evenements'
        : 'accueil'
  const addParam = searchParams.get('ajouter')

  function selectTab(next: ProTabId) {
    // `replace` : changer de rubrique ne remplit pas l'historique, le retour quitte le profil.
    // On conserve `aff` pour l’attribution d’affiliation pendant la navigation.
    const nextParams: Record<string, string> = {}
    if (next !== 'accueil') nextParams.onglet = next
    if (affParam) nextParams.aff = affParam
    setSearchParams(nextParams, { replace: true })
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (!affParam) return
    recordAffiliateClick(affParam)
  }, [affParam])

  // « Commander » depuis une fiche produit : l'article est ajouté à la sélection ici.
  const addItem = cart.add
  const items = pro?.items
  useEffect(() => {
    if (!addParam || !items || addedRef.current === addParam) return
    addedRef.current = addParam
    const item = items.find((i) => i.id === addParam)
    if (item && isOrderable(item)) addItem(item)
    const nextParams: Record<string, string> = { onglet: 'catalogue' }
    if (affParam) nextParams.aff = affParam
    setSearchParams(nextParams, { replace: true })
  }, [addParam, items, addItem, setSearchParams, affParam])

  // Un service en cours de configuration n'est pas encore public.
  if (!pro) {
    return (
      <>
        <PageHeader
          title="Établissement"
          leading={<BackLink to={paths.explore} label="Explorer" history />}
        />
        <ServiceNotFound backTo={paths.explore} />
      </>
    )
  }

  const { service } = pro
  const now = new Date(nowMs)

  function contact() {
    startConversation({
      recipient: proRecipient(service),
      professionalSpaceId: service.id,
      context: profileContext(service),
    })
  }

  return (
    <div className="service-scope bg-[#f4f5f7]" style={accentStyle(service.accent)}>
      <DashboardWelcome service={service} variant="public" />
      <ProHero
        pro={pro}
        now={now}
        onOpenContact={() => selectTab('contact')}
        onOpenCatalog={() => selectTab('catalogue')}
      />

      <>
        <ProTabs
          value={tab}
          onChange={selectTab}
          counts={{ evenements: countUpcomingEvents(pro.extras, nowMs) }}
        />

        {tab === 'accueil' ? (
          <HomeTab pro={pro} now={nowMs} onSelectTab={selectTab} onContact={contact} />
        ) : null}
        {tab === 'catalogue' ? (
          <CatalogueTab
            pro={pro}
            quantities={cart.quantityById}
            onAdd={cart.add}
            onRemove={cart.remove}
            highlightId={productParam ?? undefined}
          />
        ) : null}
        {tab === 'evenements' ? (
          <EventsTab pro={pro} now={nowMs} initialEventId={eventParam} />
        ) : null}
        {tab === 'publications' ? <PostsTab pro={pro} now={nowMs} /> : null}
        {tab === 'avis' ? <ReviewsTab pro={pro} now={nowMs} /> : null}
        {tab === 'abonnements' ? <PlansTab pro={pro} /> : null}
        {tab === 'affiliation' ? <AffiliationTab pro={pro} /> : null}
        {tab === 'profil' ? <ProfileTab pro={pro} onSelectTab={selectTab} /> : null}
        {tab === 'contact' ? (
          <ContactTab pro={pro} now={nowMs} onContact={contact} />
        ) : null}

        {cart.count > 0 || !pro.owned ? (
          <div className="sticky bottom-0 z-10 flex gap-2 border-t bg-card/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:bottom-0">
            {!pro.owned ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={contact}
                aria-label={cart.count > 0 ? 'Discuter maintenant' : undefined}
                className={cn(
                  'rounded-full',
                  cart.count > 0 ? 'w-14 shrink-0 px-0' : 'min-w-0 flex-1',
                )}
              >
                <MessageCircle aria-hidden="true" />
                {cart.count > 0 ? null : 'Discuter'}
              </Button>
            ) : null}

            {cart.count > 0 ? (
              <Button
                size="lg"
                className="min-w-0 flex-1 justify-between rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => navigate(paths.checkout(service.id))}
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBasket aria-hidden="true" />
                  Passer à la caisse
                  <span className="sr-only">
                    , {cart.count} article{cart.count > 1 ? 's' : ''}
                  </span>
                </span>
                <span aria-hidden="true">
                  {cart.count} · {formatPrice(cart.total)}
                </span>
                <span className="sr-only">{formatPrice(cart.total)}</span>
              </Button>
            ) : pro.items.length > 0 && tab !== 'catalogue' ? (
              <Button
                type="button"
                size="lg"
                className="min-w-0 flex-1 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => selectTab('catalogue')}
              >
                <Store aria-hidden="true" />
                Voir le catalogue
              </Button>
            ) : null}
          </div>
        ) : null}
      </>
    </div>
  )
}
