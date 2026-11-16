import type { AdCampaign } from '@/types/ads'
import type { ServiceOrder } from '@/types/order'
import type { ProExtras } from '@/types/pro'
import type { CatalogItem, Service, ServiceToolId } from '@/types/service'

export interface RubriqueStat {
  id: ServiceToolId
  /** Chiffre principal affiché. */
  value: string
  /** Légende courte sous le chiffre. */
  hint: string
  /** Avancement 0–100 (barre de progression). */
  progress: number
  /** Statut lisible de l’activité. */
  status: 'ok' | 'warn' | 'idle'
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/**
 * Indicateurs d’avancement par rubrique de l’Espace Pro (données locales / démo).
 * À brancher sur l’API dès qu’elle expose les agrégats.
 */
export function getRubriqueStats(input: {
  service: Service
  items: readonly CatalogItem[]
  orders: readonly ServiceOrder[]
  extras: ProExtras
  campaigns: readonly AdCampaign[]
}): RubriqueStat[] {
  const { items, orders, extras, campaigns } = input
  const pending = orders.filter((o) => o.status === 'pending').length
  const done = orders.filter((o) => o.status === 'completed').length
  const activePlans = extras.plans.filter((p) => p.status === 'active').length
  const publishedEvents = extras.events.filter((e) => e.published).length
  const activeAds = campaigns.filter((c) => c.status === 'active').length
  const unanswered = extras.reviews.filter((r) => !r.reply).length
  const posts = extras.posts.length
  const subscribers = extras.subscribers.length
  const customers = new Set(orders.map((o) => o.customerName)).size

  const catalogTarget = 8
  const catalogProgress = clamp((items.length / catalogTarget) * 100)

  return [
    {
      id: 'catalog',
      value: String(items.length),
      hint: items.length === 0 ? 'Aucun article' : 'articles au catalogue',
      progress: items.length === 0 ? 8 : catalogProgress,
      status: items.length === 0 ? 'warn' : items.length < 3 ? 'warn' : 'ok',
    },
    {
      id: 'orders',
      value: String(pending),
      hint: pending === 0 ? `${orders.length} au total` : 'en attente',
      progress:
        orders.length === 0
          ? 5
          : clamp(100 - (pending / Math.max(orders.length, 1)) * 100),
      status: pending > 0 ? 'warn' : orders.length === 0 ? 'idle' : 'ok',
    },
    {
      id: 'scanner',
      value: String(done),
      hint: 'tickets traités',
      progress: clamp(done === 0 ? 10 : Math.min(100, done * 12)),
      status: done === 0 ? 'idle' : 'ok',
    },
    {
      id: 'subscriptions',
      value: String(subscribers),
      hint: `${activePlans} forfait${activePlans > 1 ? 's' : ''}`,
      progress: clamp(
        activePlans === 0 ? 5 : 40 + Math.min(60, subscribers * 8),
      ),
      status: activePlans === 0 ? 'warn' : subscribers === 0 ? 'idle' : 'ok',
    },
    {
      id: 'events',
      value: String(extras.events.length),
      hint:
        publishedEvents > 0
          ? `${publishedEvents} publié${publishedEvents > 1 ? 's' : ''}`
          : 'aucun publié',
      progress: clamp(
        extras.events.length === 0
          ? 5
          : (publishedEvents / Math.max(extras.events.length, 1)) * 100,
      ),
      status: extras.events.length === 0 ? 'idle' : publishedEvents === 0 ? 'warn' : 'ok',
    },
    {
      id: 'ads',
      value: String(campaigns.length),
      hint: activeAds > 0 ? `${activeAds} active${activeAds > 1 ? 's' : ''}` : 'aucune active',
      progress: clamp(
        campaigns.length === 0 ? 5 : 30 + activeAds * 25,
      ),
      status: campaigns.length === 0 ? 'idle' : activeAds === 0 ? 'warn' : 'ok',
    },
    {
      id: 'channel',
      value: String(posts),
      hint: posts === 0 ? 'aucune publication' : 'publications',
      progress: clamp(posts === 0 ? 8 : Math.min(100, posts * 15)),
      status: posts === 0 ? 'warn' : 'ok',
    },
    {
      id: 'reviews',
      value: String(extras.reviews.length),
      hint:
        unanswered > 0
          ? `${unanswered} sans réponse`
          : extras.reviews.length === 0
            ? 'aucun avis'
            : 'tous traités',
      progress: clamp(
        extras.reviews.length === 0
          ? 5
          : 100 - (unanswered / extras.reviews.length) * 100,
      ),
      status:
        extras.reviews.length === 0 ? 'idle' : unanswered > 0 ? 'warn' : 'ok',
    },
    {
      id: 'customers',
      value: String(customers),
      hint: customers === 0 ? 'pas encore de clients' : 'clients connus',
      progress: clamp(customers === 0 ? 5 : Math.min(100, customers * 10)),
      status: customers === 0 ? 'idle' : 'ok',
    },
    {
      id: 'history',
      value: String(orders.length),
      hint: 'opérations enregistrées',
      progress: clamp(orders.length === 0 ? 5 : Math.min(100, orders.length * 8)),
      status: orders.length === 0 ? 'idle' : 'ok',
    },
    {
      id: 'reports',
      value: done > 0 ? `${Math.round((done / Math.max(orders.length, 1)) * 100)} %` : '—',
      hint: 'taux de clôture',
      progress: clamp(
        orders.length === 0 ? 5 : (done / Math.max(orders.length, 1)) * 100,
      ),
      status: orders.length === 0 ? 'idle' : 'ok',
    },
    {
      id: 'settings',
      value: input.service.status === 'active' ? 'OK' : '…',
      hint:
        input.service.status === 'active'
          ? 'établissement actif'
          : 'configuration à finaliser',
      progress: input.service.status === 'active' ? 100 : 45,
      status: input.service.status === 'active' ? 'ok' : 'warn',
    },
  ]
}
