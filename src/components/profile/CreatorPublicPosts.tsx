import { Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { useLocalStore } from '@/hooks/use-local-store'
import { recordPostView } from '@/lib/profile-engagement-store'
import { localPostsStore, type LocalPost } from '@/lib/social-store'

/**
 * Publications du compte connecté sur la page publique créateur :
 * mêmes posts que le profil privé (`localPostsStore`).
 */
export function CreatorPublicPosts({ isMe }: { isMe: boolean }) {
  const posts = useLocalStore(localPostsStore)
  const [opened, setOpened] = useState<LocalPost | null>(null)

  if (!isMe) {
    return (
      <EmptyState
        icon={ImageIcon}
        tone="neutral"
        title="Publications bientôt visibles"
        description="Les posts de ce créateur s’afficheront ici une fois le serveur branché."
        className="py-10"
      />
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        tone="brand"
        title="Aucune publication"
        description="Ce que vous publiez depuis l’accueil apparaît ici sur votre page publique."
        className="py-10"
      />
    )
  }

  return (
    <section aria-label="Publications publiques" className="space-y-3 px-4 py-3">
      <ul className="grid grid-cols-3 gap-0.5">
        {posts.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              aria-label={`Publication : ${post.text.slice(0, 40) || 'photo'}`}
              onClick={() => {
                recordPostView(post.id)
                setOpened(post)
              }}
              className="block aspect-square w-full overflow-hidden bg-accent"
            >
              {post.imageSrc ? (
                <img src={post.imageSrc} alt="" className="size-full object-cover" />
              ) : (
                <span className="line-clamp-5 block p-2 text-left text-caption font-semibold">
                  {post.text}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet
        open={opened !== null}
        onClose={() => setOpened(null)}
        title="Publication"
      >
        {opened ? (
          <>
            {opened.imageSrc ? (
              <img
                src={opened.imageSrc}
                alt=""
                className="max-h-96 w-full rounded-2xl object-cover"
              />
            ) : null}
            {opened.text ? (
              <p className="text-body whitespace-pre-line">{opened.text}</p>
            ) : null}
            <p className="text-caption text-muted-foreground">
              Visible aussi sur votre profil privé · démo locale
            </p>
          </>
        ) : null}
      </BottomSheet>
    </section>
  )
}
