import {
  BookOpen,
  CalendarCheck,
  Megaphone,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

interface Way {
  id: string
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
  /** Écran où l'action se fait ; absent quand le parcours n'existe pas encore. */
  to?: string
  cta?: string
}

const WAYS: readonly Way[] = [
  {
    id: 'purchase',
    title: 'Acheter chez un professionnel',
    description:
      'Dès le paiement effectué, des points sont crédités immédiatement sur votre solde.',
    icon: ShoppingBag,
    tone: 'gold',
    to: paths.explore,
    cta: 'Découvrir les boutiques',
  },
  {
    id: 'event',
    title: 'Participer à un événement',
    description:
      'Participer ou poser un rappel crédite des points tout de suite.',
    icon: CalendarCheck,
    tone: 'violet',
    to: paths.events,
    cta: 'Voir les événements',
  },
  {
    id: 'learn',
    title: 'Contribuer sur AfriLearn',
    description: 'Partagez des documents et aidez les autres élèves.',
    icon: BookOpen,
    tone: 'info',
    to: paths.learn,
    cta: 'Ouvrir AfriLearn',
  },
  {
    id: 'missions',
    title: 'Missions publicitaires',
    description:
      'Regarder une pub, visiter ou s’abonner : points immédiats, avec plafonds quotidiens.',
    icon: Megaphone,
    tone: 'amber',
    to: paths.rewardsAds,
    cta: 'Voir les missions',
  },
]

/** Comment gagner des points : chaque parcours renvoie vers l'écran où l'action se fait. */
export function RewardsEarnPage() {
  return (
    <>
      <PageHeader
        title="Gagner des points"
        leading={<BackLink to={paths.rewards} label="Rewards" history />}
      />

      <div className="space-y-4 py-4">

        <ul className="space-y-3 px-4">
          {WAYS.map((way) => (
            <li
              key={way.id}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card"
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-xl',
                  toneSoft[way.tone],
                )}
              >
                <way.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-body font-bold">{way.title}</p>
                <p className="text-caption text-muted-foreground">{way.description}</p>
                {way.to ? (
                  <Link
                    to={way.to}
                    className="inline-flex min-h-11 items-center text-body font-bold text-brand"
                  >
                    {way.cta}
                  </Link>
                ) : (
                  <p className="text-caption font-semibold">Bientôt disponible</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
