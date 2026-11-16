import { PartnerOfferCard } from '@/components/explore/PartnerOfferCard'
import type { PartnerOffer } from '@/types/partner-offer'

interface PartnerOfferStripProps {
  offers: readonly PartnerOffer[]
  /** Libellé accessible de la rangée. */
  label?: string
  className?: string
}

/** Rangée horizontale d’offres partenaires sous un contenu (vidéo, post, événement). */
export function PartnerOfferStrip({
  offers,
  label = 'Offres partenaires',
  className,
}: PartnerOfferStripProps) {
  if (offers.length === 0) return null

  return (
    <div className={className}>
      <p className="px-4 pb-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <ul
        aria-label={label}
        className="flex gap-2.5 overflow-x-auto overscroll-x-contain px-4 pb-3 [scrollbar-width:thin] snap-x snap-mandatory"
      >
        {offers.map((offer) => (
          <li key={offer.id} className="snap-start">
            <PartnerOfferCard offer={offer} />
          </li>
        ))}
      </ul>
    </div>
  )
}
