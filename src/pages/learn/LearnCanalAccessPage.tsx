import { Lock, Radio } from 'lucide-react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { CanalTelegramFeed } from '@/components/learn/CanalTelegramFeed'
import { buttonVariants } from '@/components/ui/button'
import { useAfriLearnCommerce } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  canManageCanal,
  findCanal,
  getMemberSubscription,
  hasCanalMemberAccess,
  listCanalMemberSubscribers,
} from '@/lib/afrilearn-commerce-store'
import { paths } from '@/routes/paths'

/**
 * Contenu du Canal Pro (abonnés / propriétaire) — fil inspiré de Telegram.
 */
export function LearnCanalAccessPage() {
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
  const hasAccess =
    canal && (isOwner || hasCanalMemberAccess(canal.id, profile.handle))
  const memberSub =
    canal && hasAccess && !isOwner
      ? getMemberSubscription(canal.id, profile.handle)
      : undefined
  const subscribers = canal ? listCanalMemberSubscribers(canal.id) : []

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

  if (!hasAccess) {
    if (justPaid) {
      return (
        <>
          <PageHeader
            title={canal.name}
            leading={
              <BackLink to={paths.learnMine} label="Mon AfriLearn" history />
            }
          />
          <EmptyState
            icon={Lock}
            title="Activation de l’accès…"
            description="Le paiement est enregistré. Réessayez ou ouvrez Mon AfriLearn → Canaux auxquels je suis abonné."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to={paths.learnCanalAccess(canal.id)}
                  className={buttonVariants()}
                >
                  Réessayer
                </Link>
                <Link
                  to={paths.learnMine}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Mon AfriLearn
                </Link>
              </div>
            }
            className="py-16"
          />
        </>
      )
    }
    return <Navigate to={paths.learnCanalPublic(canal.id)} replace />
  }

  const memberLabel = memberSub
    ? `Abonné · ${memberSub.planName}`
    : isOwner
      ? 'Propriétaire'
      : undefined

  return (
    <CanalTelegramFeed
      canal={canal}
      subscriberCount={subscribers.length + (isOwner ? 1 : 0)}
      isOwner={Boolean(isOwner)}
      memberLabel={memberLabel}
      justPaid={justPaid}
      backTo={isOwner ? paths.learnMine : paths.learnMarket}
      backLabel={isOwner ? 'Mon AfriLearn' : 'Marché'}
    />
  )
}
