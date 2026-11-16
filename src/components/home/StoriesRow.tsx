import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { ComposeSheet } from '@/components/home/ComposeSheet'
import { StoryViewerSheet } from '@/components/home/StoryViewerSheet'
import { useLocalStore } from '@/hooks/use-local-store'
import { useProfile } from '@/hooks/use-profile'
import {
  addLocalStory,
  localStoriesStore,
  markStorySeen,
  seenStoriesStore,
} from '@/lib/social-store'
import { cn } from '@/lib/utils'
import type { Story } from '@/types/feed'

interface StoriesRowProps {
  stories: readonly Story[]
}

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

const STORY_TONES = [
  'from-emerald-600 to-teal-800',
  'from-sky-600 to-indigo-800',
  'from-amber-500 to-orange-700',
  'from-rose-500 to-fuchsia-800',
  'from-lime-600 to-green-900',
  'from-cyan-600 to-blue-900',
] as const

function toneFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % 97
  return STORY_TONES[hash % STORY_TONES.length]
}

/**
 * Rangée de stories style Facebook : cartes verticales, « Créer une story » en premier.
 */
export function StoriesRow({ stories }: StoriesRowProps) {
  const [viewing, setViewing] = useState<Story | null>(null)
  const [composing, setComposing] = useState(false)
  const profile = useProfile()
  const own = useLocalStore(localStoriesStore)
  const seen = useLocalStore(seenStoriesStore)

  function open(story: Story) {
    if (story.isOwn && own.length === 0) {
      setComposing(true)
      return
    }
    markStorySeen(story.id)
    setViewing(story)
  }

  return (
    <section aria-label="Stories" className="home-stories">
      <ul className="home-stories-rail flex scrollbar-none gap-2.5 overflow-x-auto px-3 pb-3 pt-1 sm:px-4">
        {stories.map((story) => {
          const hasOwn = Boolean(story.isOwn) && own.length > 0
          const isSeen = story.isOwn
            ? !hasOwn
            : Boolean(story.seen) || seen.includes(story.id)
          const displayName = story.isOwn
            ? hasOwn
              ? 'Votre story'
              : 'Créer une story'
            : story.name
          const avatarName = story.isOwn ? profile.name : story.name
          const avatarSrc = story.isOwn ? profile.avatarSrc : story.avatarSrc

          return (
            <li key={story.id} className="shrink-0">
              <button
                type="button"
                onClick={() => open(story)}
                className={cn(
                  'home-story-card relative flex h-[11.5rem] w-[6.75rem] flex-col overflow-hidden rounded-xl text-left shadow-sm ring-1 ring-black/5',
                  story.isOwn && !hasOwn
                    ? 'bg-card'
                    : `bg-gradient-to-b ${toneFor(avatarName)}`,
                )}
                aria-label={
                  story.isOwn
                    ? hasOwn
                      ? 'Voir ma story'
                      : 'Créer une story'
                    : `Story de ${story.name}`
                }
              >
                {story.isOwn && !hasOwn ? (
                  <>
                    <div className="relative h-[65%] w-full overflow-hidden bg-muted">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-gradient-to-br from-muted to-muted-foreground/20 text-2xl font-extrabold text-muted-foreground">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="relative flex flex-1 flex-col items-center justify-end px-1.5 pb-2 pt-4">
                      <span className="absolute -top-4 grid size-8 place-items-center rounded-full bg-brand text-brand-foreground ring-4 ring-card">
                        <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span className="line-clamp-2 text-center text-[12px] leading-tight font-bold text-foreground">
                        {displayName}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
                    <div className="relative z-10 p-2">
                      <Avatar
                        name={avatarName}
                        src={avatarSrc}
                        size="sm"
                        ring={isSeen ? 'seen' : 'story'}
                        className="ring-2 ring-card"
                      />
                    </div>
                    <span className="relative z-10 mt-auto line-clamp-2 px-2 pb-2.5 text-[12px] leading-tight font-bold text-white drop-shadow">
                      {displayName}
                    </span>
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <StoryViewerSheet
        story={viewing}
        onClose={() => setViewing(null)}
        onAdd={() => {
          setViewing(null)
          setComposing(true)
        }}
      />
      <ComposeSheet
        open={composing}
        onClose={() => setComposing(false)}
        mode="story"
        onSubmit={(value) => {
          addLocalStory(value, timestamp())
          setComposing(false)
        }}
      />
    </section>
  )
}
