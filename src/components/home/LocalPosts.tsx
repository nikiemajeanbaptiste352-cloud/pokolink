import { Fragment } from 'react'

import { SectionDivider } from '@/components/common/SectionDivider'
import { PostCard } from '@/components/home/PostCard'
import { useLocalStore } from '@/hooks/use-local-store'
import { useNow } from '@/hooks/use-now'
import { useProfile } from '@/hooks/use-profile'
import { formatRelative, localPostsStore } from '@/lib/social-store'
import { paths } from '@/routes/paths'
import type { Post } from '@/types/feed'

/** Mes publications créées sur cet appareil, en tête du fil d'accueil. */
export function LocalPosts() {
  const posts = useLocalStore(localPostsStore)
  const profile = useProfile()
  const now = useNow(60_000)

  if (posts.length === 0) return null

  return (
    <section aria-label="Mes publications">
      {posts.map((local) => {
        const post: Post = {
          id: local.id,
          author: {
            name: profile.name,
            to: paths.profile,
            ...(profile.avatarSrc ? { avatarSrc: profile.avatarSrc } : {}),
            ...(profile.verified ? { verified: true } : {}),
          },
          time: `${formatRelative(local.createdAt, now)} · enregistrée sur cet appareil`,
          text: local.text,
          ...(local.imageSrc
            ? { media: { src: local.imageSrc, alt: 'Photo de ma publication' } }
            : {}),
          ...(local.partnershipLink
            ? { partnershipLink: local.partnershipLink }
            : {}),
          likes: 0,
          comments: 0,
          shares: 0,
        }
        return (
          <Fragment key={local.id}>
            <div className="home-feed-card">
              <PostCard post={post} own />
            </div>
            <SectionDivider className="home-immersive-divider" />
          </Fragment>
        )
      })}
    </section>
  )
}
