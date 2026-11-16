import { ArrowRight } from 'lucide-react'
import { useState, type UIEvent } from 'react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/explore'

const GAP_PX = 12

const tones: Record<Banner['tone'], { surface: string; button: string }> = {
  brand: {
    surface: 'bg-brand text-brand-foreground',
    button: 'bg-white text-neutral-900 hover:bg-white/90',
  },
  violet: {
    surface: 'bg-neutral-900 text-white',
    button: 'bg-gold text-gold-foreground hover:bg-gold/90',
  },
  gold: {
    surface: 'bg-linear-to-br from-gold to-brand text-white',
    button: 'bg-white text-neutral-900 hover:bg-white/90',
  },
}

interface BannerCarouselProps {
  banners: readonly Banner[]
}

/** Bannières promo plein cadre, style marketplace (deals / campagnes). */
export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [active, setActive] = useState(0)

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget
    const slide = list.firstElementChild as HTMLElement | null
    if (!slide) return
    const index = Math.round(list.scrollLeft / (slide.offsetWidth + GAP_PX))
    setActive(Math.min(Math.max(index, 0), banners.length - 1))
  }

  return (
    <section aria-roledescription="carrousel" aria-label="À la une" className="space-y-2.5">
      <ul
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory scroll-px-3 scrollbar-none gap-3 overflow-x-auto px-3 sm:scroll-px-4 sm:px-4"
      >
        {banners.map(({ id, title, description, cta, to, tone, icon: Icon }) => (
          <li
            key={id}
            className={cn(
              'relative w-[calc(100%-1.25rem)] shrink-0 snap-start overflow-hidden rounded-2xl',
              tones[tone].surface,
            )}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-br from-white/10 to-black/20"
            />
            <Icon
              aria-hidden="true"
              className="absolute -right-3 -bottom-3 size-32 opacity-15"
              strokeWidth={1.25}
            />
            <div className="relative flex min-h-[8.5rem] flex-col items-start justify-center gap-2.5 p-4 pr-20 sm:min-h-40 sm:p-5 sm:pr-24">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">
                  Promo
                </p>
                <h2 className="text-[1.15rem] leading-tight font-extrabold sm:text-title">
                  {title}
                </h2>
                <p className="text-[12px] opacity-90 sm:text-sm">{description}</p>
              </div>
              <Link
                to={to}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'rounded-full font-bold',
                  tones[tone].button,
                )}
              >
                {cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="flex justify-center gap-1.5">
        {banners.map(({ id }, index) => (
          <span
            key={id}
            className={cn(
              'h-1 rounded-full transition-all',
              index === active ? 'w-4 bg-brand' : 'w-1 bg-muted-foreground/25',
            )}
          />
        ))}
      </div>
    </section>
  )
}
