import {
  BookOpen,
  ChevronRight,
  HandCoins,
  Radio,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { LearnContributions } from '@/components/learn/LearnContributions'
import {
  useMyCanalSubscriptions,
  useOwnerCanal,
  useOwnerCanalSubscription,
  useSellerEduProducts,
} from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { useWalletBalances } from '@/hooks/use-wallet'
import { canManageCanal, findCanal } from '@/lib/afrilearn-commerce-store'
import { formatPlanDuration, getLearnCanalPlan } from '@/lib/afrilearn-plans'
import { formatPrice } from '@/lib/format'
import { getTempMember, TEMP_LEARN_ME } from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnAuthor } from '@/types/learn'

/** Espace privé AfriLearn : mon canal, abonnements, produits — Wallet = lien court. */
export function LearnPrivateHubPage() {
  const profile = useProfile()
  const handle = profile.handle
  const sub = useOwnerCanalSubscription(handle)
  const canal = useOwnerCanal(handle)
  const products = useSellerEduProducts(handle)
  const mySubs = useMyCanalSubscriptions(handle)
  const active = canManageCanal(handle)
  const plan = sub ? getLearnCanalPlan(sub.planId) : undefined
  const wallet = useWalletBalances()
  const publicAuthor: LearnAuthor =
    getTempMember(handle) ?? { ...TEMP_LEARN_ME, handle, name: profile.name }

  return (
    <>
      <ProfileWelcome
        name={profile.name}
        eyebrow="Mon AfriLearn"
        subtitle={profile.handle ? `@${profile.handle}` : undefined}
        avatarSrc={profile.avatarSrc}
      />
      <PageHeader
        title="Mon AfriLearn"
        leading={<BackLink to={paths.learn} label="AfriLearn" history />}
      />

      <div className="space-y-6 pb-10">
        <p className="px-4 text-caption text-muted-foreground">
          Ici vous{' '}
          <span className="font-semibold text-foreground">créez et gérez</span>{' '}
          votre Canal Pro. Pour{' '}
          <span className="font-semibold text-foreground">
            vous abonner à un autre canal
          </span>
          , ouvrez le{' '}
          <Link to={paths.learnMarket} className="font-bold text-brand">
            Marché éducatif
          </Link>
          .
        </p>

        <section className="mx-4 flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
              Paiements via Wallet AfriConnect
            </p>
            <p className="font-extrabold tabular-nums">
              {formatPrice(wallet.available)}
            </p>
          </div>
          <Link
            to={`${paths.wallet}?retour=${encodeURIComponent(paths.learnMine)}`}
            className="text-[12px] font-bold text-brand"
          >
            Ouvrir ›
          </Link>
        </section>

        <section className="space-y-2 px-4">
          <h2 className="text-body font-extrabold">Mon Canal Pro</h2>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
            {sub ? (
              <div className="space-y-2 border-b px-3.5 py-3">
                <p className="text-[12px] font-bold">
                  Abonnement propriétaire {sub.planName} ·{' '}
                  <span className={active ? 'text-brand' : 'text-danger'}>
                    {active ? 'Actif' : 'Expiré'}
                  </span>
                </p>
                <p className="text-caption text-muted-foreground">
                  {formatPrice(sub.amountPaid)}
                  {plan ? ` · ${formatPlanDuration(plan.durationDays)}` : ''} ·
                  expire le {new Date(sub.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ) : (
              <p className="border-b px-3.5 py-3 text-caption text-muted-foreground">
                Aucun abonnement propriétaire. Choisissez une formule pour créer
                votre canal.
              </p>
            )}
            <ul className="divide-y">
              <HubLink
                to={active ? paths.learnCanalManage : paths.learnCanalPlans}
                icon={Radio}
                title={active ? 'Gérer mon Canal Pro' : 'Créer mon Canal Pro'}
                detail={
                  canal
                    ? `${canal.name}${canal.published ? ' · publié' : ' · brouillon'}`
                    : 'Formules puis personnalisation'
                }
              />
              {active && canal?.published ? (
                <HubLink
                  to={paths.learnCanalAccess(canal.id)}
                  icon={Radio}
                  title="Ouvrir mon canal (contenu)"
                  detail="Espace réservé · vue abonnés"
                />
              ) : null}
              {sub ? (
                <HubLink
                  to={paths.learnCanalRenew}
                  icon={HandCoins}
                  title="Renouveler mon abonnement propriétaire"
                  detail="Payer avec le Wallet"
                />
              ) : null}
            </ul>
          </div>
        </section>

        <section className="space-y-2 px-4">
          <h2 className="text-body font-extrabold">Canaux auxquels je suis abonné</h2>
          {mySubs.length === 0 ? (
            <div className="rounded-2xl border bg-card p-3.5 shadow-card">
              <p className="text-caption text-muted-foreground">
                Aucun abonnement visiteur pour l’instant.
              </p>
              <Link
                to={paths.learnMarket}
                className="mt-2 inline-block text-[12px] font-bold text-brand"
              >
                Découvrir des canaux ›
              </Link>
            </div>
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-card">
              {mySubs.map((s) => {
                const c = findCanal(s.canalId)
                return (
                  <HubLink
                    key={s.id}
                    to={paths.learnCanalAccess(s.canalId)}
                    icon={Radio}
                    title={s.canalName}
                    detail={`${s.planName} · jusqu’au ${new Date(s.expiresAt).toLocaleDateString('fr-FR')}${c?.published ? '' : ' · canal indisponible'}`}
                  />
                )
              })}
            </ul>
          )}
        </section>

        <section className="space-y-2 px-4">
          <h2 className="text-body font-extrabold">Produits éducatifs</h2>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-card">
            <HubLink
              to={paths.learnEduProductNew}
              icon={BookOpen}
              title="Ajouter un produit"
              detail="Livre, fiche, exercice, support…"
            />
            <HubLink
              to={paths.learnEduProducts}
              icon={ShoppingBag}
              title="Mes produits"
              detail={`${products.length} fiche${products.length > 1 ? 's' : ''}`}
            />
            <HubLink
              to={paths.learnEduSales}
              icon={HandCoins}
              title="Commandes et ventes"
              detail="Revenus nets (hors abonnements Canal)"
            />
          </ul>
        </section>

        <section className="space-y-2 px-4">
          <h2 className="text-body font-extrabold">Suivi financier</h2>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-card">
            <HubLink
              to={paths.learnFinance}
              icon={HandCoins}
              title="Paiements et revenus"
              detail="Abonnements Canal · ventes · renvoie au Wallet"
            />
          </ul>
        </section>

        <section className="space-y-2 px-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-body font-extrabold">Profil public</h2>
            <Link
              to={paths.learnMember(handle.replace(/^@/, ''))}
              className="text-[12px] font-bold text-brand"
            >
              Ouvrir ›
            </Link>
          </div>
          <p className="text-caption text-muted-foreground">
            Vitrine publique uniquement. La gestion du canal se fait ici.
          </p>
          <LearnContributions author={publicAuthor} own />
        </section>
      </div>
    </>
  )
}

function HubLink({
  to,
  icon: Icon,
  title,
  detail,
}: {
  to: string
  icon: typeof Radio
  title: string
  detail: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-14 items-center gap-3 px-3.5 py-3 hover:bg-muted/60"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold">{title}</span>
          <span className="block truncate text-caption text-muted-foreground">
            {detail}
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}
