import { Briefcase, Pencil, Plus, QrCode, Rocket, ScanLine, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { PageHeader } from '@/components/common/PageHeader'
import { ServiceCover } from '@/components/services/ServiceCover'
import { buttonVariants } from '@/components/ui/button'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { useServiceItems, useServices } from '@/hooks/use-services'
import { accentStyle } from '@/lib/service-accents'
import { getServiceTypeMeta } from '@/lib/service-types'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/60 bg-background/70 px-2.5 py-3 text-center backdrop-blur-sm">
      <dd className="truncate text-body font-extrabold tracking-tight tabular-nums">
        {value}
      </dd>
      <dt className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
    </div>
  )
}

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-foreground shadow-sm transition-colors hover:bg-muted'

/** Carte d'un établissement : couverture, identité, chiffres et accès à son espace. */
function ProServiceCard({ service }: { service: Service }) {
  const items = useServiceItems(service.id)
  const orders = useServiceOrders(service)
  const customerCount = new Set(orders.map((order) => order.customerName)).size
  const meta = getServiceTypeMeta(service.type)
  const isDraft = service.status === 'draft'
  const [message, setMessage] = useState('')

  async function share() {
    const url = `${window.location.origin}${paths.establishment(service.username)}`
    const result = await shareOrCopy(url, service.name)
    if (result === 'copied') setMessage('Lien copié dans le presse-papiers.')
    else if (result === 'shared') setMessage('Lien partagé.')
    else if (result === 'failed') setMessage('Impossible de partager ce lien.')
    else setMessage('')
  }

  return (
    <div className="service-scope" style={accentStyle(service.accent)}>
      <section
        aria-label={service.name}
        className="group overflow-hidden rounded-[1.35rem] border border-border/70 bg-card/95 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-28px_rgba(15,23,42,0.4)]"
      >
        <ServiceCover service={service} showOpenStatus={!isDraft} className="h-36">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
          />
          <span
            className={cn(
              'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md',
              isDraft
                ? 'bg-warning/95 text-black'
                : 'border border-white/20 bg-black/55 text-white',
            )}
          >
            {isDraft ? 'À configurer' : 'Actif'}
          </span>
          <Link
            to={paths.serviceSettings(service.id)}
            aria-label={`Modifier ${service.name}`}
            className="absolute top-1 right-1 grid size-11 place-items-center"
          >
            <span className="grid size-9 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/70">
              <Pencil className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </ServiceCover>

        <div className="relative space-y-4 bg-linear-to-b from-card to-muted/20 p-4 pt-0">
          <div className="-mt-11 flex items-end gap-3">
            <Media
              src={service.logo || undefined}
              alt=""
              icon={meta.icon}
              tone={meta.tone}
              className="relative z-10 size-[4.25rem] shrink-0 rounded-2xl border-[3px] border-card bg-card shadow-md"
            />
            {isDraft ? null : (
              <div className="ml-auto flex gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => void share()}
                  aria-label={`Partager ${service.name}`}
                  className={iconButton}
                >
                  <Share2 className="size-5" aria-hidden="true" />
                </button>
                <Link
                  to={paths.establishment(service.username)}
                  aria-label={`Code QR et page publique de ${service.name}`}
                  className={iconButton}
                >
                  <QrCode className="size-5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-title font-extrabold tracking-tight">
              {service.name}
            </h2>
            <p className="truncate text-caption text-muted-foreground">
              {meta.label}
              {service.city ? ` · ${service.city}` : ''}
            </p>
          </div>

          {isDraft ? (
            <Link
              to={paths.serviceSettings(service.id)}
              className={buttonVariants({ className: 'w-full' })}
            >
              Continuer la configuration
            </Link>
          ) : (
            <>
              <dl className="grid grid-cols-3 gap-2">
                <Stat label={meta.catalogLabel} value={String(items.length)} />
                <Stat label="Commandes" value={String(orders.length)} />
                <Stat label="Clients" value={String(customerCount)} />
              </dl>
              <div className="grid grid-cols-2 gap-2">
                <Link to={paths.service(service.id)} className={buttonVariants()}>
                  Tableau de bord
                </Link>
                <Link
                  to={paths.establishment(service.username)}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Profil public
                </Link>
                <Link
                  to={paths.serviceScanner(service.id)}
                  className={buttonVariants({
                    variant: 'secondary',
                    className: 'col-span-2',
                  })}
                >
                  <ScanLine aria-hidden="true" />
                  Scanner tickets et cartes
                </Link>
                <Link
                  to={paths.serviceAdNew(service.id)}
                  className={buttonVariants({
                    variant: 'secondary',
                    className: 'col-span-2',
                  })}
                >
                  <Rocket aria-hidden="true" />
                  Créer une publicité
                </Link>
              </div>
            </>
          )}

          {message ? (
            <p role="status" className="text-center text-caption text-muted-foreground">
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

/**
 * Espace Pro : la liste des Services Pro de l'utilisateur, une carte par établissement.
 * Chaque carte ouvre le tableau de bord (rubriques, statistiques) ou la configuration.
 */
export function EspaceProPage() {
  const { services } = useServices()

  return (
    <div className="relative min-h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--brand)_10%,transparent)_0%,transparent_55%),linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--muted)_45%,var(--background))_100%)]"
      />
      <PageHeader
        title="Espace Pro"
        leading={<BackLink to={paths.profile} label="Profil" />}
        actions={
          <Link
            to={paths.serviceNew}
            aria-label="Créer un service"
            className={cn(buttonVariants({ size: 'icon' }), 'rounded-full')}
          >
            <Plus className="size-5" aria-hidden="true" />
          </Link>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          tone="gold"
          title="Aucune activité"
          description="Créez votre première activité professionnelle : boutique, restaurant, transport… Chaque activité a son propre espace."
          action={
            <Link to={paths.serviceNew} className={buttonVariants({ size: 'lg' })}>
              <Plus aria-hidden="true" />
              Créer un service
            </Link>
          }
          className="py-20"
        />
      ) : (
        <ul aria-label="Vos Services Pro" className="grid gap-5 p-4 md:grid-cols-2 lg:gap-6">
          {services.map((service) => (
            <li key={service.id} className="min-w-0">
              <ProServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
