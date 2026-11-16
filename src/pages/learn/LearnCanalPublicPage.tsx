import { Check, Radio } from 'lucide-react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { buttonVariants } from '@/components/ui/button'
import { useAfriLearnCommerce } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  canManageCanal,
  findCanal,
  getMemberSubscription,
  hasCanalMemberAccess,
} from '@/lib/afrilearn-commerce-store'
import {
  formatPlanDuration,
  LEARN_CANAL_MEMBER_PLAN_DEFAULT,
  LEARN_CANAL_MEMBER_PLANS,
  memberPlanPrice,
} from '@/lib/afrilearn-plans'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/**
 * Page publique du Canal Pro (vitrine).
 * « S’abonner » → paiement immédiat ; abonnés → accès canal.
 * Photo du haut → reste ici (page publique) / profil auteur.
 */
export function LearnCanalPublicPage() {
  useAfriLearnCommerce()
  const { canalId } = useParams()
  const [params] = useSearchParams()
  const justPaid = params.get('paye') === '1'
  const canal = findCanal(canalId)
  const profile = useProfile()
  const ownerActive = canal ? canManageCanal(canal.ownerHandle) : false
  const isOwner =
    canal &&
    canal.ownerHandle.toLowerCase() ===
      profile.handle.replace(/^@/, '').toLowerCase()
  const memberAccess =
    canal && hasCanalMemberAccess(canal.id, profile.handle)
  const memberSub =
    canal && memberAccess && !isOwner
      ? getMemberSubscription(canal.id, profile.handle)
      : undefined

  // Après paiement ou si déjà abonné : entrer dans le canal (sauf propriétaire sur sa vitrine).
  if (canal && ownerActive && canal.published && memberAccess && !isOwner && justPaid) {
    return <Navigate to={`${paths.learnCanalAccess(canal.id)}?paye=1`} replace />
  }

  if (!canal || !canal.published || !ownerActive) {
    return (
      <>
        <PageHeader
          title="Canal"
          leading={<BackLink to={paths.learnMarket} label="Marché" history />}
        />
        <EmptyState
          icon={Radio}
          title="Canal indisponible"
          description="Ce canal n’est pas publié ou l’abonnement du propriétaire a expiré."
          action={
            <Link to={paths.learnMarket} className={buttonVariants()}>
              Marché éducatif
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  const defaultPrice = memberPlanPrice(canal, LEARN_CANAL_MEMBER_PLAN_DEFAULT)

  return (
    <>
      <ProfileWelcome
        name={canal.name}
        eyebrow="Canal Pro"
        subtitle={canal.tagline || `@${canal.ownerHandle}`}
        avatarSrc={canal.logo || undefined}
      />
      <PageHeader
        title={canal.name}
        leading={<BackLink to={paths.learnMarket} label="Marché" history />}
        actions={
          <Link
            to={paths.learnMember(canal.ownerHandle)}
            aria-label={`Profil public de @${canal.ownerHandle}`}
            className="relative -mr-1 rounded-full ring-2 ring-brand/30 ring-offset-2 ring-offset-background"
            title="Profil public de l’auteur"
          >
            <Avatar
              name={canal.name}
              src={canal.logo || undefined}
              size="md"
            />
            <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-brand ring-2 ring-background" />
          </Link>
        }
      />
      <div className="space-y-4 px-4 pb-10">
        <section className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
          <Link
            to={paths.learnMember(canal.ownerHandle)}
            className="shrink-0 rounded-full ring-2 ring-brand/20 ring-offset-2 ring-offset-card"
            aria-label={`Profil de @${canal.ownerHandle}`}
          >
            <Avatar name={canal.name} src={canal.logo || undefined} size="xl" />
          </Link>
          <div className="min-w-0 flex-1 space-y-1">
            {canal.tagline ? (
              <p className="text-body font-semibold text-brand">{canal.tagline}</p>
            ) : null}
            <p className="text-body whitespace-pre-line text-muted-foreground">
              {canal.description || 'Présentation à venir.'}
            </p>
            <Link
              to={paths.learnMember(canal.ownerHandle)}
              className="inline-block text-caption font-bold text-brand"
            >
              @{canal.ownerHandle} · page publique
            </Link>
          </div>
        </section>

        {memberSub || isOwner ? (
          <section className="space-y-2 rounded-2xl border border-brand/30 bg-brand/5 p-3.5">
            <p className="text-[13px] font-bold text-brand">
              {isOwner
                ? 'Vous êtes le propriétaire de ce canal.'
                : `Vous êtes abonné · ${memberSub!.planName}`}
            </p>
            {memberSub ? (
              <p className="text-caption text-muted-foreground">
                Accès jusqu’au{' '}
                {new Date(memberSub.expiresAt).toLocaleDateString('fr-FR')}
              </p>
            ) : null}
            <Link
              to={paths.learnCanalAccess(canal.id)}
              className={buttonVariants({ className: 'w-full' })}
            >
              Accéder au canal
            </Link>
          </section>
        ) : null}

        {canal.memberPlansEnabled && !isOwner && !memberAccess ? (
          <section className="space-y-3">
            <Link
              to={paths.learnCanalSubscribe(canal.id)}
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              S’abonner · {formatPrice(defaultPrice)}
            </Link>
            <p className="text-center text-caption text-muted-foreground">
              Paiement Wallet immédiat · forfait{' '}
              {
                LEARN_CANAL_MEMBER_PLANS.find(
                  (p) => p.id === LEARN_CANAL_MEMBER_PLAN_DEFAULT,
                )?.name
              }
            </p>

            <div>
              <h2 className="text-body font-extrabold">Autres forfaits</h2>
              <p className="text-caption text-muted-foreground">
                Choisissez une autre durée si besoin.
              </p>
            </div>
            <ul className="space-y-3">
              {LEARN_CANAL_MEMBER_PLANS.map((plan) => {
                const price = memberPlanPrice(canal, plan.id)
                const featured = plan.id === LEARN_CANAL_MEMBER_PLAN_DEFAULT
                return (
                  <li
                    key={plan.id}
                    className={cn(
                      'space-y-3 rounded-2xl border bg-card p-4 shadow-card',
                      featured && 'border-brand/40 ring-1 ring-brand/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-title font-extrabold">{plan.name}</h3>
                        <p className="text-caption text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-title font-extrabold tabular-nums text-brand">
                          {formatPrice(price)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatPlanDuration(plan.durationDays)}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-caption"
                        >
                          <Check
                            className="mt-0.5 size-3.5 shrink-0 text-brand"
                            aria-hidden="true"
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={paths.learnCanalMemberPay(canal.id, plan.id)}
                      className={buttonVariants({
                        variant: featured ? 'default' : 'outline',
                        className: 'w-full',
                      })}
                    >
                      S’abonner · Wallet
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {canal.memberPlansEnabled && !isOwner && memberAccess ? (
          <Link
            to={paths.learnCanalSubscribe(canal.id)}
            className={buttonVariants({ variant: 'outline', className: 'w-full' })}
          >
            Prolonger · Wallet
          </Link>
        ) : null}

        {!canal.memberPlansEnabled && !isOwner ? (
          <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-caption text-muted-foreground">
            Les abonnements visiteurs ne sont pas encore activés sur ce canal.
          </p>
        ) : null}
      </div>
    </>
  )
}
