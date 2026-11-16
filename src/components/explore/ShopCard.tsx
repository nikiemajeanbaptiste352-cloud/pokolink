import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { Media } from '@/components/common/Media'
import { Rating } from '@/components/common/Rating'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { buttonVariants } from '@/components/ui/button'
import { formatCount } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { Shop } from '@/types/explore'

interface ShopCardProps {
  shop: Shop
}

/** Carte boutique : couverture, logo, abonnés, note et bouton « Visiter ». */
export function ShopCard({ shop }: ShopCardProps) {
  return (
    <div className="w-40 overflow-hidden rounded-xl border bg-card shadow-card">
      <Media icon={Store} tone="gold" className="h-16 w-full" />
      <div className="space-y-1.5 px-3 pb-3 text-center">
        <Avatar
          name={shop.name}
          src={shop.logoSrc}
          size="lg"
          className="-mt-6 rounded-full ring-4 ring-card"
        />
        <p className="flex items-center justify-center gap-1 text-sm font-bold">
          <span className="truncate">{shop.name}</span>
          {shop.verified ? <VerifiedBadge /> : null}
        </p>
        <p className="text-caption text-muted-foreground">
          {formatCount(shop.followers)} abonnés
        </p>
        <p className="flex items-center justify-center gap-1 text-caption text-muted-foreground">
          {shop.products} produits · <Rating value={shop.rating} />
        </p>
        <Link
          to={paths.establishment(shop.proRef)}
          className={buttonVariants({ variant: 'violet', className: 'w-full' })}
          aria-label={`Visiter la boutique ${shop.name}`}
        >
          Visiter
        </Link>
      </div>
    </div>
  )
}
