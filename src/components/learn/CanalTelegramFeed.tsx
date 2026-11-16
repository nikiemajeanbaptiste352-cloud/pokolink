import { Link, useNavigate } from 'react-router-dom'

import { TelegramChannelFeed } from '@/components/channel/TelegramChannelFeed'
import { BackLink } from '@/components/common/BackLink'
import { useLocalStore } from '@/hooks/use-local-store'
import {
  addCanalPost,
  canalFeedStore,
  listCanalPosts,
} from '@/lib/afrilearn-canal-feed-store'
import { formatCount } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { LearnCanalPro } from '@/types/afrilearn-commerce'

interface CanalTelegramFeedProps {
  canal: LearnCanalPro
  subscriberCount: number
  isOwner: boolean
  memberLabel?: string
  justPaid?: boolean
  backTo?: string
  backLabel?: string
}

/** AfriLearn → fil Telegram partagé. */
export function CanalTelegramFeed({
  canal,
  subscriberCount,
  isOwner,
  memberLabel,
  justPaid,
  backTo = paths.learnMarket,
  backLabel = 'Marché',
}: CanalTelegramFeedProps) {
  useLocalStore(canalFeedStore)
  const navigate = useNavigate()
  const posts = listCanalPosts(canal.id)

  return (
    <TelegramChannelFeed
      title={canal.name}
      subtitle={`${formatCount(Math.max(subscriberCount, 1))} abonné${subscriberCount > 1 ? 's' : ''}${memberLabel ? ` · ${memberLabel}` : ''}`}
      avatarSrc={canal.logo || undefined}
      tagline={canal.tagline || undefined}
      description={
        canal.description ||
        'Canal éducatif réservé aux abonnés. Les publications apparaissent ici.'
      }
      leading={<BackLink to={backTo} label={backLabel} history />}
      onInfo={() => navigate(paths.learnCanalPublic(canal.id))}
      posts={posts.map((p) => ({
        id: p.id,
        text: p.text,
        createdAt: p.createdAt,
        views: p.views,
        imageSrc: p.imageSrc,
        author: canal.name,
      }))}
      canCompose={isOwner}
      onSend={(text) => {
        addCanalPost({ canalId: canal.id, text })
      }}
      banner={
        justPaid ? (
          <p
            role="status"
            className="mx-auto mb-3 max-w-[22rem] rounded-xl bg-brand/90 px-3 py-2 text-center text-[12px] font-semibold text-white shadow-sm"
          >
            Paiement confirmé — bienvenue dans le canal
          </p>
        ) : null
      }
      readOnlyFooter={
        !isOwner ? (
          <p className="mx-auto max-w-[34rem] text-center text-[12px] text-[#6d7a88]">
            Canal en lecture seule ·{' '}
            <Link
              to={paths.learnCanalSubscribe(canal.id)}
              className="font-bold text-brand"
            >
              Prolonger l’abonnement
            </Link>
          </p>
        ) : undefined
      }
    />
  )
}
