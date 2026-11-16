import { MessageCircle, Plus } from 'lucide-react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Button } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import { useLocalStore } from '@/hooks/use-local-store'
import { useNow } from '@/hooks/use-now'
import { formatRelative, localStoriesStore } from '@/lib/social-store'
import { paths } from '@/routes/paths'
import type { Story } from '@/types/feed'

/** Visionneuse de story : mes stories (locales) ou l'aperçu provisoire de celle d'un contact. */
export function StoryViewerSheet({
  story,
  onClose,
  onAdd,
}: {
  story: Story | null
  onClose: () => void
  onAdd: () => void
}) {
  const own = useLocalStore(localStoriesStore)
  const now = useNow(60_000)
  const startConversation = useStartConversation()

  return (
    <BottomSheet
      open={story !== null}
      onClose={onClose}
      title={story?.isOwn ? 'Ma story' : `Story de ${story?.name ?? ''}`}
    >
      {story?.isOwn ? (
        <>
          <ul className="space-y-3">
            {own.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-2xl border">
                {item.imageSrc ? (
                  <img
                    src={item.imageSrc}
                    alt="Photo de ma story"
                    className="aspect-4/5 max-h-96 w-full object-cover"
                  />
                ) : null}
                <div className="space-y-1 p-3">
                  {item.text ? <p className="text-body">{item.text}</p> : null}
                  <p className="text-caption text-muted-foreground">
                    {formatRelative(item.createdAt, now)} · enregistrée sur cet appareil
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Ajouter une story
          </Button>
        </>
      ) : story ? (
        <>
          <div
            role="img"
            aria-label={`Story de ${story.name}`}
            className="grid aspect-4/5 max-h-96 w-full place-items-center rounded-2xl bg-linear-to-br from-brand/40 to-gold/40 text-center"
          >
            <p className="px-6 text-title font-extrabold">{story.name}</p>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              startConversation({
                recipient: { id: `story:${story.id}`, name: story.name, kind: 'direct' },
                context: {
                  type: 'user',
                  id: story.id,
                  label: `Story de ${story.name}`,
                  to: paths.home,
                },
              })
            }
          >
            <MessageCircle aria-hidden="true" />
            Répondre par message
          </Button>
        </>
      ) : null}
    </BottomSheet>
  )
}
