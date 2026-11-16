import { CheckCheck, Info, SendHorizonal, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface TelegramFeedPost {
  id: string
  text: string
  createdAt: number
  views?: number
  imageSrc?: string
  /** Libellé auteur au-dessus du message (nom du canal). */
  author?: string
  /** Pastille optionnelle (ex. Brouillon, Sponsorisé). */
  badge?: string
}

function formatMsgTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Aujourd’hui'
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function sameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export interface TelegramChannelFeedProps {
  title: string
  subtitle: string
  avatarSrc?: string
  description?: string
  tagline?: string
  posts: readonly TelegramFeedPost[]
  /** Bouton retour / leading à gauche. */
  leading?: ReactNode
  /** Action infos (icône). */
  onInfo?: () => void
  infoTo?: string
  InfoIcon?: LucideIcon
  canCompose?: boolean
  composePlaceholder?: string
  onSend?: (text: string) => void
  /** Contenu sous la barre (onglets, etc.). */
  belowHeader?: ReactNode
  /** Bannière dans le fil (ex. paiement OK). */
  banner?: ReactNode
  /** Pied alternatif si pas de compose. */
  readOnlyFooter?: ReactNode
  /** Actions extras à côté du compose (ex. ouvrir formulaire riche). */
  composeExtra?: ReactNode
  className?: string
}

/**
 * Fil canal style Telegram — partagé AfriLearn + Espace Pro.
 */
export function TelegramChannelFeed({
  title,
  subtitle,
  avatarSrc,
  description,
  tagline,
  posts,
  leading,
  onInfo,
  InfoIcon = Info,
  canCompose = false,
  composePlaceholder = 'Publier sur le canal…',
  onSend,
  belowHeader,
  banner,
  readOnlyFooter,
  composeExtra,
  className,
}: TelegramChannelFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [posts.length, title])

  function send() {
    const text = draft.trim()
    if (!text || !onSend) return
    onSend(text)
    setDraft('')
  }

  return (
    <div
      className={cn(
        'canal-tg flex h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom,0px))] min-h-0 flex-col bg-[#e8eef5] md:h-[calc(100dvh-8rem)]',
        className,
      )}
    >
      <header className="pt-safe sticky top-0 z-20 flex shrink-0 flex-col border-b border-black/5 bg-[#f7f8fa]/95 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-1 px-1.5">
          {leading}
          <button
            type="button"
            onClick={onInfo}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1 py-2 text-left hover:bg-black/[0.04]"
          >
            <Avatar name={title} src={avatarSrc} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold leading-tight text-[#1a1a1a]">
                {title}
              </span>
              <span className="block truncate text-[12px] text-[#6d7a88]">
                {subtitle}
              </span>
            </span>
          </button>
          {onInfo ? (
            <button
              type="button"
              aria-label="Infos du canal"
              onClick={onInfo}
              className="grid size-10 shrink-0 place-items-center rounded-full text-[#6d7a88] hover:bg-black/[0.05]"
            >
              <InfoIcon className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {belowHeader}
      </header>

      <div className="canal-tg-wallpaper relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-3">
        {banner}
        <div className="mx-auto flex max-w-[34rem] flex-col gap-1.5">
          <div className="mb-2 self-center rounded-2xl bg-white/90 px-4 py-3 text-center shadow-sm ring-1 ring-black/[0.04]">
            <Avatar name={title} src={avatarSrc} size="xl" className="mx-auto" />
            <p className="mt-2 text-[15px] font-bold text-[#1a1a1a]">{title}</p>
            {tagline ? (
              <p className="mt-0.5 text-[12px] text-[#6d7a88]">{tagline}</p>
            ) : null}
            {description ? (
              <p className="mt-2 text-[12px] leading-snug whitespace-pre-line text-[#4a5562]">
                {description}
              </p>
            ) : null}
          </div>

          {posts.length === 0 ? (
            <p className="self-center rounded-full bg-black/45 px-3 py-1 text-[12px] font-medium text-white">
              Aucune publication pour l’instant
            </p>
          ) : null}

          {posts.map((post, index) => {
            const prev = posts[index - 1]
            const showDay = !prev || !sameDay(prev.createdAt, post.createdAt)
            return (
              <div key={post.id} className="flex flex-col gap-1.5">
                {showDay ? (
                  <p className="self-center rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white capitalize">
                    {formatDayLabel(post.createdAt)}
                  </p>
                ) : null}
                <article className="canal-tg-bubble relative max-w-[92%] self-start rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-sm ring-1 ring-black/[0.04]">
                  {post.badge ? (
                    <p className="mb-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                      {post.badge}
                    </p>
                  ) : null}
                  <p className="text-[12px] font-bold text-brand">
                    {post.author ?? title}
                  </p>
                  {post.imageSrc ? (
                    <img
                      src={post.imageSrc}
                      alt=""
                      className="mt-1.5 max-h-56 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <p className="mt-0.5 text-[14.5px] leading-snug whitespace-pre-wrap text-[#1c2430]">
                    {post.text}
                  </p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#8a96a3]">
                    <span>{formatMsgTime(post.createdAt)}</span>
                    <CheckCheck
                      className="size-3.5 text-brand/80"
                      aria-hidden="true"
                    />
                    {post.views !== undefined ? (
                      <span>{formatCount(post.views)}</span>
                    ) : null}
                  </p>
                </article>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {canCompose ? (
        <div className="pb-safe shrink-0 border-t border-black/5 bg-[#f7f8fa] px-2 py-2">
          <div className="mx-auto flex max-w-[34rem] items-end gap-2">
            {composeExtra}
            <label className="sr-only" htmlFor="tg-compose">
              Nouveau message
            </label>
            <textarea
              id="tg-compose"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={composePlaceholder}
              className="max-h-28 min-h-11 flex-1 resize-none rounded-[1.25rem] border-0 bg-white px-3.5 py-2.5 text-[14.5px] shadow-sm ring-1 ring-black/[0.06] outline-none focus:ring-brand/40"
            />
            <button
              type="button"
              aria-label="Envoyer"
              disabled={!draft.trim()}
              onClick={send}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm disabled:opacity-40"
            >
              <SendHorizonal className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : readOnlyFooter ? (
        <div className="pb-safe shrink-0 border-t border-black/5 bg-[#f7f8fa] px-3 py-2.5">
          {readOnlyFooter}
        </div>
      ) : null}
    </div>
  )
}
