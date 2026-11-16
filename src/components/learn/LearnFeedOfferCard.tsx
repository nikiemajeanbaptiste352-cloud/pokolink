import { BookOpen, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { useProfile } from '@/hooks/use-profile'
import { LEARN_EDU_KIND_LABEL } from '@/lib/afrilearn-commerce-labels'
import { hasCanalMemberAccess } from '@/lib/afrilearn-commerce-store'
import {
  formatPrice,
} from '@/lib/format'
import {
  LEARN_CANAL_MEMBER_PLAN_DEFAULT,
  memberPlanPrice,
} from '@/lib/afrilearn-plans'
import { paths } from '@/routes/paths'
import type { LearnCanalPro, LearnEduProduct } from '@/types/afrilearn-commerce'

/** Carte Canal Pro dans un fil : photo → page publique, Abonner → paiement. */
export function LearnCanalFeedCard({ canal }: { canal: LearnCanalPro }) {
  const profile = useProfile()
  const own =
    canal.ownerHandle.toLowerCase() ===
    profile.handle.replace(/^@/, '').toLowerCase()
  const subscribed = hasCanalMemberAccess(canal.id, profile.handle)
  const price = memberPlanPrice(canal, LEARN_CANAL_MEMBER_PLAN_DEFAULT)

  const actionTo = own
    ? paths.learnCanalAccess(canal.id)
    : subscribed
      ? paths.learnCanalAccess(canal.id)
      : canal.memberPlansEnabled
        ? paths.learnCanalSubscribe(canal.id)
        : paths.learnCanalPublic(canal.id)

  const actionLabel = own
    ? 'Accéder'
    : subscribed
      ? 'Accéder'
      : canal.memberPlansEnabled
        ? `S’abonner · ${formatPrice(price)}`
        : 'Voir'

  return (
    <article className="flex w-[16.5rem] shrink-0 flex-col gap-2 rounded-2xl border border-info/30 bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2">
        <Link
          to={paths.learnCanalPublic(canal.id)}
          aria-label={`Page publique · ${canal.name}`}
          className="shrink-0 rounded-full ring-2 ring-info/30 ring-offset-1 ring-offset-card"
        >
          <Avatar name={canal.name} src={canal.logo || undefined} size="md" />
        </Link>
        <span className="text-[10px] font-extrabold tracking-wide text-info uppercase">
          Canal Pro
        </span>
      </div>
      <Link to={paths.learnCanalPublic(canal.id)} className="space-y-1">
        <span className="line-clamp-2 block text-[14px] font-extrabold leading-snug">
          {canal.name}
        </span>
        <span className="line-clamp-2 block text-caption text-muted-foreground">
          {canal.tagline || canal.description || 'Canal éducatif'}
        </span>
        <span className="block text-[11px] font-semibold text-muted-foreground">
          @{canal.ownerHandle}
        </span>
      </Link>
      <Link
        to={actionTo}
        className={
          own || subscribed || !canal.memberPlansEnabled
            ? 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-info/15 px-3 py-2 text-center text-[12px] font-extrabold text-info'
            : 'rounded-xl bg-brand px-3 py-2 text-center text-[12px] font-extrabold text-brand-foreground'
        }
      >
        {!own && !subscribed && canal.memberPlansEnabled ? null : (
          <Radio className="size-3.5" aria-hidden="true" />
        )}
        {actionLabel}
      </Link>
    </article>
  )
}

/** Carte produit éducatif dans un fil de discussion AfriLearn. */
export function LearnProductFeedCard({ product }: { product: LearnEduProduct }) {
  return (
    <article className="flex w-[16.5rem] shrink-0 flex-col gap-2 rounded-2xl border border-brand/30 bg-card p-3.5 shadow-card">
      <Link to={paths.learnEduProduct(product.id)} className="space-y-2">
        <span className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand">
            <BookOpen className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-extrabold tracking-wide text-brand uppercase">
            Produit
          </span>
        </span>
        <span className="line-clamp-2 block text-[14px] font-extrabold leading-snug">
          {product.name}
        </span>
        <span className="block text-caption text-muted-foreground">
          {LEARN_EDU_KIND_LABEL[product.kind]} · @{product.sellerHandle}
        </span>
        <span className="block font-extrabold tabular-nums text-brand">
          {formatPrice(product.price)}
        </span>
      </Link>
      <Link
        to={paths.learnEduCheckout(product.id)}
        className="rounded-xl bg-brand px-3 py-2 text-center text-[12px] font-extrabold text-brand-foreground"
      >
        Acheter · Wallet
      </Link>
    </article>
  )
}
