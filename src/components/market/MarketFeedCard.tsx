import { Clock, Droplets, Eye, Heart, Share2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { formatCount, formatPrice } from '@/lib/format'
import { DEMO_PARTNERSHIP_LINK } from '@/lib/partnership-link'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CreatorMarket } from '@/types/market'

import { DetailsToggle } from './DetailsToggle'
import {
  formatCote,
  formatCoverage,
  formatPercent,
  getRhythmLine,
  getTrend,
  STATUS_LABEL,
} from './market-utils'
import { MarketVideo } from './MarketVideo'
import { Sparkline } from './Sparkline'
import { TrendBadge } from './TrendBadge'

interface MarketFeedCardProps {
  market: CreatorMarket
  index: number
  /** Carte actuellement centrée dans le fil TikTok. */
  active?: boolean
  /** Mode « vidéo seule » : toutes les informations superposées sont masquées. */
  clean: boolean
  onToggleClean: () => void
  /** Ouvre la feuille : OUI / NON se choisit dans le formulaire. */
  onParticipate: (market: CreatorMarket) => void
}

const railButton =
  'grid size-11 place-items-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-sm transition-[transform,background-color] hover:bg-black/60 active:scale-95 sm:size-12'

const shadow = { textShadow: '0 1px 3px rgb(0 0 0 / 0.6)' }

/** Une cote en plein écran, fil vertical type TikTok : vidéo, cote et prise de position. */
export function MarketFeedCard({
  market,
  index,
  active = false,
  clean,
  onToggleClean,
  onParticipate,
}: MarketFeedCardProps) {
  const [liked, setLiked] = useState(false)
  const [notice, setNotice] = useState('')
  const isOpen =
    market.status === 'open' &&
    market.updateState !== 'suspended' &&
    market.poolState === 'covered'
  const { trend, ratio } = getTrend(market)

  async function share() {
    const url = `${window.location.origin}${paths.marketEvent(market.id)}`
    const result = await shareOrCopy(url, `${market.creatorName} · Creator Market`)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      data-event-id={market.id}
      aria-label={`${market.creatorName} : ${market.title}`}
      data-active={active ? 'true' : undefined}
      className="cote-tiktok-slide relative h-full overflow-hidden bg-black text-white"
    >
      <MarketVideo market={market} index={index} active={active} />
      {clean ? null : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/95 via-black/55 to-transparent"
        />
      )}

      {/* Rail TikTok à droite : profil, j’aime, partage, détails. */}
      <div className="absolute right-2 bottom-4 z-30 flex flex-col items-center gap-2.5 sm:right-2.5 sm:bottom-5 sm:gap-3.5 [@media(max-height:700px)]:gap-2">
        <>
          <Link
            to={paths.marketEvent(market.id)}
            aria-label={`Voir l’événement de ${market.creatorName}`}
            className="rounded-full shadow-lg ring-2 ring-white/80"
          >
            <Avatar
              name={market.creatorName}
              src={market.creatorAvatar}
              size="lg"
              ring="story"
            />
          </Link>
          <button
            type="button"
            onClick={() => setLiked((value) => !value)}
            aria-pressed={liked}
            aria-label={`J’aime (${formatCount(market.likes + (liked ? 1 : 0))})`}
            className={railButton}
          >
            <Heart
              className={cn('size-5 sm:size-6', liked && 'fill-[#f43f5e] text-[#f43f5e]')}
              aria-hidden="true"
            />
          </button>
          <span
            className="-mt-1.5 text-[11px] font-extrabold tabular-nums"
            style={shadow}
            aria-hidden="true"
          >
            {formatCount(market.likes + (liked ? 1 : 0))}
          </span>
          <button
            type="button"
            onClick={() => void share()}
            aria-label={`Partager (${formatCount(market.shares)})`}
            className={railButton}
          >
            <Share2 className="size-5 sm:size-6" aria-hidden="true" />
          </button>
          <span
            className="-mt-1.5 text-[11px] font-extrabold tabular-nums"
            style={shadow}
            aria-hidden="true"
          >
            {formatCount(market.shares)}
          </span>
        </>
        <DetailsToggle clean={clean} onToggle={onToggleClean} />
      </div>

      {/* Mode « vidéo seule » : seuls le statut et les vues restent à gauche. */}
      {clean ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/60 to-transparent"
          />
          <p
            className="absolute bottom-5 left-4 z-10 flex min-w-0 max-w-[calc(100%-5rem)] flex-wrap items-center gap-2 text-caption font-bold"
            style={shadow}
          >
            <span className="shrink-0 rounded-full bg-black/55 px-2 py-0.5">
              {STATUS_LABEL[market.status]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4 shrink-0" aria-hidden="true" />
              {formatCount(market.validatedViews)} vues
            </span>
          </p>
        </>
      ) : null}
      {/* Informations en bas à gauche : masquées en mode « vidéo seule ». */}
      {clean ? null : (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-40 space-y-2.5 p-3 pr-[4.25rem] transition-opacity duration-300 sm:space-y-3 sm:p-4 sm:pr-[4.5rem]',
            '[@media(max-height:700px)]:space-y-2 [@media(max-height:700px)]:pb-3',
            active ? 'opacity-100' : 'opacity-90',
          )}
        >
          <div className="pointer-events-auto min-w-0 space-y-1" style={shadow}>
            <p className="flex min-w-0 flex-wrap items-center gap-2 text-body font-bold">
              <Link
                to={paths.creator(market.creatorHandle)}
                className="min-w-0 truncate underline-offset-2 hover:underline"
              >
                @{market.creatorHandle}
              </Link>
              <span className="shrink-0 rounded-full bg-black/55 px-2 py-0.5 text-caption font-bold">
                {STATUS_LABEL[market.status]}
              </span>
            </p>
            <p className="line-clamp-2 text-[13px] leading-snug sm:text-body">
              {market.caption}
            </p>
            <p className="line-clamp-1 text-caption font-semibold [@media(max-height:700px)]:hidden">
              {market.hashtags.map((tag) => `#${tag}`).join(' ')}
            </p>
            <PartnershipLinkBanner
              href={market.partnershipLink || DEMO_PARTNERSHIP_LINK}
              tone="onDark"
              className="mt-1"
            />
          </div>

          <div className="min-w-0 space-y-2 rounded-2xl bg-black/55 p-2.5 ring-1 ring-white/10 backdrop-blur-md sm:p-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
              <div className="min-w-0 shrink-0">
                <p className="text-caption text-white/85">Facteur</p>
                <p className="text-2xl leading-none font-extrabold tracking-tight tabular-nums sm:text-3xl">
                  {formatCote(market.cote)}
                </p>
                <p
                  className={cn(
                    'mt-1 text-caption font-extrabold tabular-nums',
                    trend === 'up' && 'text-[#86efac]',
                    trend === 'down' && 'text-[#fca5a5]',
                    trend === 'flat' && 'text-white/80',
                  )}
                >
                  {trend === 'flat' ? 'Stable' : formatPercent(ratio)}
                </p>
              </div>
              <Sparkline
                values={market.history}
                baseline={1}
                className="min-w-0 flex-1 basis-24 text-white"
              />
              <TrendBadge market={market} onDark className="shrink-0" />
            </div>
            <p className="line-clamp-2 text-caption font-semibold text-white [@media(max-height:700px)]:line-clamp-1">
              {getRhythmLine(market)}
            </p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-white/85 [@media(max-height:620px)]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <Droplets className="size-4 shrink-0" aria-hidden="true" />
                Pool {formatPrice(market.poolBalance)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 shrink-0" aria-hidden="true" />
                {formatCount(market.participants)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                {market.timeLabel}
              </span>
            </p>
          </div>

          {isOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onParticipate(market)
              }}
              className="pointer-events-auto relative z-50 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-extrabold text-neutral-900 shadow-lg transition-transform active:scale-[0.98] hover:bg-white/95 sm:text-base"
            >
              Participer · OUI / NON
            </button>
          ) : (
            <p className="rounded-2xl bg-white/20 px-3 py-2.5 text-center text-[13px] leading-snug font-semibold backdrop-blur-sm sm:rounded-full sm:px-4 sm:py-3 sm:text-body">
              {market.status === 'upcoming'
                ? 'Les positions ouvriront avec l’événement.'
                : market.status === 'closed'
                  ? 'Événement terminé : positions closes.'
                  : market.updateState === 'suspended'
                    ? 'Calcul suspendu : positions en pause.'
                    : `Liquidité limitée (${formatCoverage(market.coverageRatio)}) : nouvelles positions bloquées.`}
            </p>
          )}
          <p role="status" className="text-caption empty:hidden" style={shadow}>
            {notice}
          </p>
        </div>
      )}

      {clean && isOpen ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 bg-linear-to-t from-black/90 to-transparent p-3 pt-8 pr-16">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onParticipate(market)
            }}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-extrabold text-neutral-900 shadow-lg"
          >
            Participer · OUI / NON
          </button>
        </div>
      ) : null}
    </article>
  )
}
