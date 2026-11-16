import { ClipboardList, Eye, Plus, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { ActivityPanel } from '@/components/services/ActivityPanel'
import { RubriqueOverviewCards } from '@/components/services/DashboardRubriques'
import { OrderCard } from '@/components/services/orders/OrderCard'
import { ServiceCover } from '@/components/services/ServiceCover'
import { buttonVariants } from '@/components/ui/button'
import { useAdCampaigns } from '@/hooks/use-ad-campaigns'
import { useCurrentService } from '@/hooks/use-current-service'
import { useNow } from '@/hooks/use-now'
import { useProExtras } from '@/hooks/use-pro-extras'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { useServiceItems } from '@/hooks/use-services'
import { formatPrice } from '@/lib/format'
import { getRubriqueStats } from '@/lib/service-rubrique-stats'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { ServiceToolId } from '@/types/service'

/** Rubriques mises en avant (accès rapide). */
const OVERVIEW_IDS: readonly ServiceToolId[] = [
  'orders',
  'catalog',
  'customers',
  'channel',
  'reviews',
  'ads',
  'affiliation',
  'events',
  'subscriptions',
  'reports',
]

function KpiTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.28)]">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-title font-extrabold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

/**
 * Tableau de bord Espace Pro : accueil animé, puis structure
 * Accueil → indicateurs → activité → rubriques → commandes.
 */
export function ServiceDashboardPage() {
  const service = useCurrentService()
  const meta = getServiceTypeMeta(service.type)
  const Icon = meta.icon
  const base = paths.service(service.id)
  const orders = useServiceOrders(service)
  const items = useServiceItems(service.id)
  const { data: extras } = useProExtras(service)
  const campaigns = useAdCampaigns(service.id)
  const now = useNow(60_000)
  const navigate = useNavigate()
  const recent = orders.slice(0, 3)
  const pending = orders.filter((order) => order.status === 'pending').length
  const completed = orders.filter((order) => order.status === 'completed')
  const revenue = completed.reduce((sum, order) => sum + order.total, 0)
  const place = [meta.label, service.city].filter(Boolean).join(' · ')

  const stats = useMemo(
    () =>
      getRubriqueStats({
        service,
        items,
        orders,
        extras,
        campaigns,
      }),
    [service, items, orders, extras, campaigns],
  )

  const health = Math.round(
    stats.reduce((sum, s) => sum + s.progress, 0) / Math.max(stats.length, 1),
  )

  return (
    <div className="relative pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,color-mix(in_srgb,var(--primary)_14%,transparent)_0%,transparent_55%)]"
      />

      {/* 1 · Identité */}
      <section className="pro-dash-section">
        <ServiceCover service={service} className="h-32 sm:h-36">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/88 via-black/40 to-black/10"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3.5 text-white sm:p-4">
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/35 bg-primary text-primary-foreground shadow-lg ring-2 ring-white/15 sm:size-14">
              {service.logo ? (
                <img src={service.logo} alt="" className="size-full object-cover" />
              ) : (
                <Icon className="size-6" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1 pb-0.5">
              <p className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.16em] text-white/75 uppercase">
                <Sparkles className="size-3 text-gold" aria-hidden="true" />
                Tableau de bord
              </p>
              <h2 className="mt-0.5 line-clamp-1 text-title leading-tight font-extrabold tracking-tight">
                Bienvenue chez {service.name}
              </h2>
              <p className="truncate text-caption text-white/85">{place}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-1.5 w-16 overflow-hidden rounded-full bg-white/25 sm:w-24"
                  role="meter"
                  aria-label="Santé de l’espace"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={health}
                >
                  <span
                    className="block h-full rounded-full bg-white transition-[width] duration-500"
                    style={{ width: `${health}%` }}
                  />
                </span>
                <p className="text-[11px] font-semibold tracking-wide text-white/90 uppercase">
                  Santé · {health} %
                </p>
              </div>
            </div>
          </div>
        </ServiceCover>
      </section>

      <div className="mx-auto max-w-180 space-y-5 p-3 sm:space-y-6 sm:p-5">
        {/* 2 · Indicateurs */}
        <section className="pro-dash-section grid grid-cols-3 gap-2 sm:gap-3">
          <KpiTile
            label="Commandes"
            value={String(orders.length)}
            hint={`${pending} en attente`}
          />
          <KpiTile label="Catalogue" value={String(items.length)} hint="articles" />
          <KpiTile label="Encaissé" value={formatPrice(revenue)} hint="clôturé" />
        </section>

        {/* 3 · Activité */}
        <section className="pro-dash-section space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                Performance
              </p>
              <h3 className="text-body font-extrabold tracking-tight sm:text-title">
                Activité de l’établissement
              </h3>
            </div>
            <Link
              to={paths.establishment(service.username)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-xl border-border/80 bg-card/90',
              )}
            >
              <Eye aria-hidden="true" />
              Public
            </Link>
          </div>
          <ActivityPanel
            service={service}
            size="hero"
            metrics={['visitors', 'revenue', 'orders']}
            ranges={[7, 30, 90]}
          />
        </section>

        {/* 4 · Rubriques */}
        <section className="pro-dash-section space-y-2.5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Rubriques
            </p>
            <h3 className="text-body font-extrabold tracking-tight sm:text-title">
              Accès rapide
            </h3>
          </div>
          <RubriqueOverviewCards
            serviceId={service.id}
            stats={stats}
            ids={OVERVIEW_IDS}
          />
        </section>

        {/* 5 · Commandes */}
        <section className="pro-dash-section space-y-3 rounded-2xl border border-border/60 bg-muted/15 pt-4 pb-2">
          <SectionHeader
            title="Commandes récentes"
            description={`${orders.length} commandes · ${pending} en attente`}
            action={
              <Link
                to={`${base}/commandes`}
                className="inline-flex min-h-11 items-center text-body font-semibold text-brand"
              >
                Voir tout
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              tone="info"
              title="Aucune commande"
              description="Les commandes de vos clients apparaîtront ici."
              className="py-6"
            />
          ) : (
            <ul className="space-y-3 px-3 pb-2 sm:px-4">
              {recent.map((order) => (
                <li key={order.id}>
                  <OrderCard
                    order={order}
                    now={now}
                    onOpen={() => navigate(`${base}/commandes`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 z-10 h-0 md:bottom-4">
        <Link
          to={paths.serviceItemNew(service.id)}
          aria-label={`Ajouter : ${meta.catalogLabel.toLowerCase()}`}
          className="absolute right-4 bottom-0 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_36px_-12px_var(--primary)] ring-4 ring-background transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          <Plus className="size-7" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
