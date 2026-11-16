import { Clock, Coins, Eye, Heart, Share2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { DetailsToggle } from '@/components/market/DetailsToggle'
import { MarketVideo } from '@/components/market/MarketVideo'
import { Sparkline } from '@/components/market/Sparkline'
import { formatCount, formatPrice } from '@/lib/format'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CoinEvent, CoinPosition } from '@/types/coin-market'

import { formatPercent } from '@/components/market/market-utils'

import {
  COIN_STATE_LABEL,
  canRequestWithdrawal,
  coinValueHistory,
  formatCoins,
  formatIndex,
  getCoinPriceChange,
} from './coin-utils'

interface CoinFeedCardProps {
  event: CoinEvent
  index: number
  /** Carte actuellement centrée dans le fil TikTok. */
  active?: boolean
  /** Mode « vidéo seule » : toutes les informations superposées sont masquées. */
  clean: boolean
  onToggleClean: () => void
  onBuy: (event: CoinEvent) => void
  /** Position locale / démo du participant sur cet événement. */
  myPosition?: CoinPosition | null
  onWithdraw?: (position: CoinPosition) => void
}

const railButton =
  'grid size-11 place-items-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-sm transition-[transform,background-color] hover:bg-black/60 active:scale-95 sm:size-12'

const shadow = { textShadow: '0 1px 3px rgb(0 0 0 / 0.6)' }

/** Texte à la place du bouton d'achat quand l'événement n'accepte plus d'achat. */
function getClosedLine(event: CoinEvent): string {
  switch (event.state) {
    case 'purchases_closed':
      return 'Tous les coins sont vendus : l’événement attend son début.'
    case 'running':
      return 'Achats fermés : l’événement a commencé.'
    case 'closing':
      return 'Clôture en cours : pool épuisé.'
    case 'closed':
      return 'Événement clôturé.'
    case 'suspended':
      return 'Événement suspendu : opérations en pause.'
    case 'purchases_open':
      return ''
  }
}

/** Un événement « coins » en plein écran, façon fil vertical : vidéo, valeur du coin, achat. */
export function CoinFeedCard({
  event,
  index,
  active = false,
  clean,
  onToggleClean,
  onBuy,
  myPosition = null,
  onWithdraw,
}: CoinFeedCardProps) {
  const [liked, setLiked] = useState(false)
  const [notice, setNotice] = useState('')
  const started = event.state !== 'purchases_open' && event.state !== 'purchases_closed'
  const soldShare = event.maxCoins > 0 ? (event.soldCoins / event.maxCoins) * 100 : 0
  const canBuy = event.state === 'purchases_open'
  const canWithdraw =
    Boolean(myPosition) &&
    Boolean(onWithdraw) &&
    canRequestWithdrawal(event) &&
    (myPosition?.coins ?? 0) > 0 &&
    (myPosition?.payableNow ?? 0) > 0
  const priceSeries = coinValueHistory(event)
  const { ratio: priceRatio } = getCoinPriceChange(event)
  const priceFlat = Math.abs(priceRatio) < 0.0005

  async function share() {
    const url = `${window.location.origin}${paths.coinEvent(event.id)}`
    const result = await shareOrCopy(url, `${event.creatorName} · Creator Market`)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      data-event-id={event.id}
      aria-label={`${event.creatorName} : événement coins`}
      data-active={active ? 'true' : undefined}
      className="cote-tiktok-slide relative h-full overflow-hidden bg-black text-white"
    >
      <MarketVideo market={event} index={index} active={active} />
      {clean ? null : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/95 via-black/55 to-transparent"
        />
      )}

      {/* Actions à droite : toujours visibles (j'aime, partage, détails) avec leurs compteurs. */}
      <div className="absolute right-2 bottom-4 z-30 flex flex-col items-center gap-2.5 sm:right-3 sm:gap-3 [@media(max-height:700px)]:gap-2">
        <>
          <Link
            to={paths.coinEvent(event.id)}
            aria-label={`Voir l’événement de ${event.creatorName}`}
            className="rounded-full"
          >
            <Avatar
              name={event.creatorName}
              src={event.creatorAvatar}
              size="lg"
              ring="story"
            />
          </Link>
          <button
            type="button"
            onClick={() => setLiked((value) => !value)}
            aria-pressed={liked}
            aria-label={`J’aime (${formatCount(event.likes + (liked ? 1 : 0))})`}
            className={railButton}
          >
            <Heart
              className={cn('size-6', liked && 'fill-[#f43f5e] text-[#f43f5e]')}
              aria-hidden="true"
            />
          </button>
          <span
            className="-mt-2 text-caption font-semibold"
            style={shadow}
            aria-hidden="true"
          >
            {formatCount(event.likes + (liked ? 1 : 0))}
          </span>
          <button
            type="button"
            onClick={() => void share()}
            aria-label={`Partager (${formatCount(event.shares)})`}
            className={railButton}
          >
            <Share2 className="size-6" aria-hidden="true" />
          </button>
          <span
            className="-mt-2 text-caption font-semibold"
            style={shadow}
            aria-hidden="true"
          >
            {formatCount(event.shares)}
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
            className="absolute bottom-5 left-4 z-10 flex items-center gap-2 text-caption font-bold"
            style={shadow}
          >
            <span className="rounded-full bg-black/55 px-2 py-0.5">
              {COIN_STATE_LABEL[event.state]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden="true" />
              {formatCount(event.validatedViews)} vues
            </span>
          </p>
        </>
      ) : null}
      {/* Bas de slide compact : handle → prix → CTA (toujours dans le cadre visible). */}
      {clean ? null : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 min-w-0 space-y-2 bg-linear-to-t from-black/95 via-black/55 to-transparent p-3 pt-10 pr-[4.25rem] sm:p-4 sm:pr-20">
          <div className="pointer-events-auto min-w-0 space-y-1" style={shadow}>
            <p className="flex min-w-0 flex-wrap items-center gap-2 text-body font-bold">
              <Link
                to={paths.creator(event.creatorHandle)}
                className="min-w-0 truncate underline-offset-2 hover:underline"
              >
                @{event.creatorHandle}
              </Link>
              <span className="max-w-full shrink-0 rounded-full bg-black/55 px-2 py-0.5 text-caption font-bold">
                {COIN_STATE_LABEL[event.state]}
              </span>
            </p>
            <p className="line-clamp-1 text-[13px] leading-snug sm:line-clamp-2 sm:text-body">
              {event.caption}
            </p>
          </div>

          {/* Pancarte prix + variation dans le temps */}
          <div
            className="pointer-events-none min-w-0 space-y-2 rounded-2xl bg-black/55 p-2.5 ring-1 ring-white/10 backdrop-blur-md sm:p-3"
            style={shadow}
          >
            <div className="flex min-w-0 items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-caption text-white/85">
                  {started ? 'Valeur d’un coin' : 'Prix d’un coin'}
                </p>
                <p className="text-2xl leading-none font-extrabold tabular-nums">
                  {formatPrice(started ? event.coinValue : event.coinPrice)}
                </p>
                <p
                  className={cn(
                    'mt-1 text-caption font-extrabold tabular-nums',
                    priceFlat && 'text-white/80',
                    !priceFlat && priceRatio > 0 && 'text-[#86efac]',
                    !priceFlat && priceRatio < 0 && 'text-[#fca5a5]',
                  )}
                >
                  {priceFlat
                    ? started
                      ? 'Stable'
                      : 'Prix fixe jusqu’au démarrage'
                    : formatPercent(priceRatio)}
                  {started ? (
                    <span className="ml-1.5 font-semibold text-white/75">
                      · indice {formatIndex(event.index)}
                    </span>
                  ) : null}
                </p>
              </div>
              <Sparkline
                values={priceSeries}
                baseline={event.coinPrice}
                minSpan={Math.max(20, event.coinPrice * 0.2)}
                className="h-11 min-w-0 flex-1 basis-24 text-white"
              />
            </div>
            {!started ? (
              <div
                role="meter"
                aria-label="Coins vendus"
                aria-valuemin={0}
                aria-valuemax={event.maxCoins}
                aria-valuenow={event.soldCoins}
                aria-valuetext={`${formatCoins(event.soldCoins)} coins vendus sur ${formatCoins(event.maxCoins)}`}
                className="h-2 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  aria-hidden="true"
                  className="h-full rounded-full bg-white"
                  style={{ width: `${soldShare}%` }}
                />
              </div>
            ) : null}
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Coins className="size-3.5 shrink-0" aria-hidden="true" />
                Pool {formatPrice(event.poolBalance)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                {event.participants}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                {event.startLabel}
              </span>
            </p>
          </div>

          <div className="pointer-events-auto relative z-50 flex flex-col gap-2">
            {canBuy ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onBuy(event)
                }}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-extrabold text-[#15803d] shadow-lg ring-1 ring-black/10 transition-transform active:scale-[0.98] hover:bg-white/95"
              >
                <Coins className="size-5 shrink-0" aria-hidden="true" />
                Participer
              </button>
            ) : null}
            {canWithdraw && myPosition && onWithdraw ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onWithdraw(myPosition)
                }}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#fbbf24] text-[15px] font-extrabold text-neutral-900 shadow-lg ring-1 ring-black/10 transition-transform active:scale-[0.98] hover:bg-[#f59e0b]"
              >
                Retirer ma position
              </button>
            ) : null}
            {!canBuy && !canWithdraw ? (
              <p className="rounded-2xl bg-white/20 px-3 py-2.5 text-center text-[13px] leading-snug font-semibold backdrop-blur-sm">
                {getClosedLine(event)}
              </p>
            ) : null}
          </div>

          <p
            role="status"
            className="pointer-events-none text-caption empty:hidden"
            style={shadow}
          >
            {notice}
          </p>
        </div>
      )}

      {clean && (canBuy || canWithdraw) ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 space-y-2 bg-linear-to-t from-black/90 to-transparent p-3 pt-8 pr-16">
          {canBuy ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBuy(event)
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-extrabold text-[#15803d] shadow-lg"
            >
              <Coins className="size-5 shrink-0" aria-hidden="true" />
              Participer
            </button>
          ) : null}
          {canWithdraw && myPosition && onWithdraw ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onWithdraw(myPosition)
              }}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#fbbf24] text-[15px] font-extrabold text-neutral-900 shadow-lg"
            >
              Retirer ma position
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
