import { ExternalLink, Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'

import { partnershipLinkLabel } from '@/lib/partnership-link'
import { cn } from '@/lib/utils'

interface PartnershipLinkBannerProps {
  href: string
  className?: string
  /** Variante sombre (cartes vidéo plein écran). */
  tone?: 'default' | 'onDark'
}

/**
 * Bandeau cliquable sous un contenu : ouvre la page du partenariat
 * (profil vendeur / forfait / affiliation) — pas la participation ni le paiement d’événement.
 */
export function PartnershipLinkBanner({
  href,
  className,
  tone = 'default',
}: PartnershipLinkBannerProps) {
  const label = partnershipLinkLabel(href)
  const internal = href.startsWith('/')
  const classNames = cn(
    'flex min-h-12 w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left font-semibold shadow-md transition-colors',
    tone === 'default' &&
      'border-2 border-brand/40 bg-brand/10 text-foreground hover:bg-brand/15',
    tone === 'onDark' &&
      'bg-white text-neutral-900 ring-2 ring-white/90 hover:bg-white/95',
    className,
  )

  const body = (
    <>
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-xl',
          tone === 'default' ? 'bg-brand text-brand-foreground' : 'bg-brand text-brand-foreground',
        )}
      >
        <Handshake className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-extrabold tracking-wide text-brand uppercase">
          Lien partenaire · Toucher pour ouvrir
        </span>
        <span className="block truncate text-body font-bold">{label}</span>
      </span>
      <ExternalLink className="size-4 shrink-0 opacity-70" aria-hidden="true" />
    </>
  )

  if (internal) {
    return (
      <Link
        to={href}
        className={classNames}
        aria-label={`Lien partenaire : ${label}. Ouvrir la page publique du partenariat`}
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames}
      aria-label={`Lien partenaire : ${label}. Ouvrir`}
      onClick={(e) => e.stopPropagation()}
    >
      {body}
    </a>
  )
}
