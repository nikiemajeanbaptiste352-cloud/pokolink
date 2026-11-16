import { Crown, Store } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SubscriptionCardPanel } from '@/components/subscriptions/SubscriptionCardPanel'
import { buttonVariants } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { useMySubscriptionCards } from '@/hooks/use-subscription-cards'
import { getCardStatus, SUBSCRIPTION_STATUS } from '@/lib/subscription-labels'
import { paths } from '@/routes/paths'

/** Détail d'une carte d'abonnement de l'utilisateur : la carte, son QR code et son statut. */
export function SubscriptionCardPage() {
  const { cardId } = useParams()
  const card = useMySubscriptionCards().find((item) => item.id === cardId)
  const now = useNow(60_000)

  if (!card) {
    return (
      <>
        <PageHeader
          title="Carte d’abonnement"
          leading={<BackLink to={paths.tickets} label="Tickets" history />}
        />
        <EmptyState
          icon={Crown}
          tone="gold"
          title="Carte introuvable"
          description="Cette carte n’existe pas ou n’est pas associée à votre compte."
          action={
            <Link to={paths.tickets} className={buttonVariants()}>
              Mes tickets
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const meta = SUBSCRIPTION_STATUS[getCardStatus(card, now)]

  return (
    <>
      <PageHeader
        title="Carte d’abonnement"
        leading={<BackLink to={paths.tickets} label="Tickets" history />}
      />
      <div className="space-y-4 px-4 py-4">
        <SubscriptionCardPanel card={card} now={now} />
        <section
          aria-label="État de la carte"
          className="mx-auto max-w-sm space-y-1 rounded-2xl bg-muted p-4"
        >
          <p className="text-body font-extrabold">{meta.headline}</p>
          <p className="text-body">{meta.message}</p>
        </section>
        <div className="mx-auto grid max-w-sm gap-2">
          <Link
            to={paths.establishment(card.proRef)}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            <Store aria-hidden="true" />
            Voir le profil du Service Pro
          </Link>
        </div>
      </div>
    </>
  )
}
