import {
  ArrowUpRight,
  Award,
  Briefcase,
  Check,
  Globe,
  Handshake,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { SectionCard } from '@/components/pro-public/SectionCard'
import { Button, buttonVariants } from '@/components/ui/button'
import type { PublicPro } from '@/hooks/use-public-pro'
import type { HighlightKind, ProHighlight } from '@/lib/directory'
import { getDayIndex, getOpenStatus } from '@/lib/hours'
import {
  getCategories,
  getCompanyFacts,
  getContactLinks,
  getHoursRows,
  getMapUrl,
  getRatingDistribution,
  type CompanyFact,
  type ContactId,
} from '@/lib/pro-profile'
import type { ProTabId } from '@/lib/pro-tabs'
import { cn } from '@/lib/utils'
import type { Review } from '@/types/pro'
import type { CatalogItem } from '@/types/service'

const HIGHLIGHT_ICONS: Record<HighlightKind, LucideIcon> = {
  experience: Award,
  clients: Handshake,
  projects: Briefcase,
  quality: Check,
}

const CONTACT_ICONS: Record<ContactId, LucideIcon> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  facebook: Link2,
  instagram: Link2,
  tiktok: Link2,
}

const DESCRIPTION_CLAMP_AT = 160

// ------------------------------------------------------------------- Briques

/** Fiche signalétique : libellé à gauche, valeur à droite, une ligne par information. */
export function FactsList({ facts }: { facts: readonly CompanyFact[] }) {
  return (
    <dl className="divide-y text-body">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]"
        >
          <dt className="text-muted-foreground">{fact.label}</dt>
          <dd className="font-semibold break-words">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Chiffres clés de l'établissement (expérience, clients, réalisations, qualité). */
export function KeyFigures({ highlights }: { highlights: readonly ProHighlight[] }) {
  if (highlights.length === 0) return null
  return (
    <SectionCard title="Chiffres clés">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {highlights.map((highlight) => {
          const Icon = HIGHLIGHT_ICONS[highlight.kind]
          return (
            <li
              key={highlight.kind}
              className="flex items-center gap-2.5 rounded-xl bg-muted p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10">
                <Icon className="size-5 text-brand" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-caption leading-tight">
                <strong className="block text-body text-foreground">
                  {highlight.value}
                </strong>
                <span className="text-muted-foreground">{highlight.label}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

/** Catégories du catalogue, avec le nombre d'articles ; chacune ouvre le catalogue. */
export function CategoryChips({
  items,
  onSelect,
}: {
  items: readonly CatalogItem[]
  onSelect: () => void
}) {
  const categories = getCategories(items)
  if (categories.length < 2) return null
  return (
    <ul aria-label="Catégories" className="flex flex-wrap gap-1.5">
      {categories.map((category) => (
        <li key={category.name}>
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-background px-3 text-caption font-semibold hover:bg-muted"
          >
            {category.name}
            <span className="text-muted-foreground">{category.count}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Répartition des avis par note (5 étoiles à 1), d'après les avis publiés. */
export function RatingDistribution({
  reviews,
  total,
}: {
  reviews: readonly Review[]
  /** Nombre total d'avis annoncé, pour signaler une répartition partielle. */
  total: number
}) {
  if (reviews.length === 0) return null
  return (
    <div className="space-y-1.5">
      <ul aria-label="Répartition des notes" className="space-y-1">
        {getRatingDistribution(reviews).map((bar) => (
          <li key={bar.stars} className="flex items-center gap-2 text-caption">
            <span className="w-14 shrink-0 tabular-nums">
              {bar.stars} étoile{bar.stars > 1 ? 's' : ''}
            </span>
            <span
              aria-hidden="true"
              className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-gold"
                style={{ width: `${bar.share}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-muted-foreground tabular-nums">
              {bar.count}
            </span>
          </li>
        ))}
      </ul>
      {total > reviews.length ? (
        <p className="text-caption text-muted-foreground">
          Répartition des {reviews.length} avis affichés.
        </p>
      ) : null}
    </div>
  )
}

function ExternalMark({ external }: { external: boolean }) {
  return external ? (
    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  ) : null
}

// ------------------------------------------------------------------ Accueil

/** Présentation de l'accueil : description, premières informations, lien vers le profil. */
export function OverviewCard({
  pro,
  onSelectTab,
}: {
  pro: PublicPro
  onSelectTab: (tab: ProTabId) => void
}) {
  const { service } = pro
  const [expanded, setExpanded] = useState(false)
  const long = service.description.length > DESCRIPTION_CLAMP_AT
  const facts = getCompanyFacts(pro).slice(0, 4)

  return (
    <SectionCard title="Intro" seeAll="À propos" onSeeAll={() => onSelectTab('profil')}>
      {service.description ? (
        <div>
          <p
            id="pro-description"
            className={cn('text-body', !expanded && long && 'line-clamp-3')}
          >
            {service.description}
          </p>
          {long ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="pro-description"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex min-h-11 items-center text-body font-semibold text-brand"
            >
              {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
          ) : null}
        </div>
      ) : null}
      <FactsList facts={facts} />
    </SectionCard>
  )
}

/** Appel à contacter, en bas de l'accueil : discussion et premiers moyens de contact. */
export function ContactBand({
  pro,
  onContact,
  onSelectTab,
}: {
  pro: PublicPro
  onContact: () => void
  onSelectTab: (tab: ProTabId) => void
}) {
  const links = getContactLinks(pro.service).slice(0, 2)
  return (
    <SectionCard
      title={`Contacter ${pro.service.name}`}
      seeAll="Tous les contacts"
      onSeeAll={() => onSelectTab('contact')}
    >
      {pro.service.welcomeMessage ? (
        <p className="text-body text-muted-foreground">{pro.service.welcomeMessage}</p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-3">
        {pro.owned ? null : (
          <Button size="lg" onClick={onContact}>
            <MessageCircle aria-hidden="true" />
            Discuter
          </Button>
        )}
        {links.map((link) => {
          const Icon = CONTACT_ICONS[link.id]
          return (
            <a
              key={link.id}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              <Icon aria-hidden="true" />
              {link.label}
              {link.external ? <span className="sr-only"> (nouvel onglet)</span> : null}
            </a>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ------------------------------------------------------------------- Profil

/** Profil complet : présentation, fiche entreprise, chiffres clés et catégories. */
export function ProfileTab({
  pro,
  onSelectTab,
}: {
  pro: PublicPro
  onSelectTab: (tab: ProTabId) => void
}) {
  const { service } = pro
  const facts = getCompanyFacts(pro)
  return (
    <div className="space-y-4 px-4 pt-4 pb-4">
      <SectionCard title="Présentation">
        {service.description ? (
          <p className="text-body">{service.description}</p>
        ) : (
          <p className="text-body text-muted-foreground">
            Cet établissement n’a pas encore rédigé de présentation.
          </p>
        )}
        {service.welcomeMessage ? (
          <p className="flex gap-2 rounded-xl bg-muted p-3 text-body">
            <Quote className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="min-w-0 break-words">{service.welcomeMessage}</span>
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title="Fiche entreprise">
        <FactsList facts={facts} />
      </SectionCard>

      <KeyFigures highlights={pro.highlights} />

      {getCategories(pro.items).length > 0 ? (
        <SectionCard
          title="Catégories"
          seeAll="Voir le catalogue"
          onSeeAll={() => onSelectTab('catalogue')}
        >
          <ul className="flex flex-wrap gap-1.5">
            {getCategories(pro.items).map((category) => (
              <li
                key={category.name}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-caption font-semibold"
              >
                {category.name}
                <span className="text-muted-foreground">{category.count}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ Contact

/** Moyens de contact, adresse avec itinéraire et horaires d'ouverture. */
export function ContactTab({
  pro,
  now,
  onContact,
}: {
  pro: PublicPro
  /** Heure courante, en millisecondes. */
  now: number
  onContact: () => void
}) {
  const { service } = pro
  const links = getContactLinks(service)
  const mapUrl = getMapUrl(service)
  const date = new Date(now)
  const status = getOpenStatus(service.hours, date)
  const rows = getHoursRows(service.hours, getDayIndex(date))
  const place = [service.address, service.city, service.country]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-4 px-4 pt-4 pb-4">
      <SectionCard title="Nous contacter">
        {pro.owned ? null : (
          <Button size="lg" className="w-full" onClick={onContact}>
            <MessageCircle aria-hidden="true" />
            Discuter maintenant
          </Button>
        )}
        {links.length > 0 ? (
          <ul className="divide-y rounded-xl border">
            {links.map((link) => {
              const Icon = CONTACT_ICONS[link.id]
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="flex min-h-14 items-center gap-3 px-3 py-2 hover:bg-muted"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10">
                      <Icon className="size-4.5 text-brand" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-caption text-muted-foreground">
                        {link.label}
                      </span>
                      <span className="block truncate text-body font-semibold">
                        {link.value}
                      </span>
                    </span>
                    <ExternalMark external={link.external} />
                    {link.external ? (
                      <span className="sr-only">(nouvel onglet)</span>
                    ) : null}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Phone}
            title="Aucun contact public"
            description="Utilisez la discussion pour joindre cet établissement."
            className="py-4"
          />
        )}
      </SectionCard>

      {place ? (
        <SectionCard title="Adresse">
          <p className="flex gap-2 text-body">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="min-w-0 break-words">{place}</span>
          </p>
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              <Navigation aria-hidden="true" />
              Itinéraire
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          ) : null}
        </SectionCard>
      ) : null}

      <SectionCard title="Horaires d’ouverture">
        <p
          className={cn(
            'text-caption font-bold',
            status.open ? 'text-brand' : 'text-danger',
          )}
        >
          {status.label}
        </p>
        <ul className="divide-y text-body">
          {rows.map((row) => (
            <li
              key={row.day}
              aria-current={row.today ? 'date' : undefined}
              className={cn(
                'flex items-center justify-between gap-3 py-2',
                row.today && 'font-extrabold',
              )}
            >
              <span>
                {row.day}
                {row.today ? (
                  <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-caption font-bold text-brand">
                    Aujourd’hui
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  'tabular-nums',
                  !row.open && 'font-normal text-muted-foreground',
                )}
              >
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
