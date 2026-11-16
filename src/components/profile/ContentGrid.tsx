import { Image, Play, Square, Video, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { FilterChips } from '@/components/common/FilterChips'
import { Media } from '@/components/common/Media'
import { useLocalStore } from '@/hooks/use-local-store'
import { recordPostView } from '@/lib/profile-engagement-store'
import { localPostsStore, type LocalPost } from '@/lib/social-store'
import type { Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'publications', label: 'Publications' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'photos', label: 'Photos' },
  { id: 'videos', label: 'Vidéos' },
] as const

type TabId = (typeof tabs)[number]['id']

/** Aspect, icône et teinte du visuel provisoire selon l'onglet. */
const tabStyles: Record<
  TabId,
  { icon: LucideIcon; tone: Tone; ratio: string; noun: string }
> = {
  publications: {
    icon: Square,
    tone: 'brand',
    ratio: 'aspect-square',
    noun: 'Publication',
  },
  shorts: { icon: Play, tone: 'violet', ratio: 'aspect-[3/4]', noun: 'Short' },
  photos: { icon: Image, tone: 'gold', ratio: 'aspect-square', noun: 'Photo' },
  videos: { icon: Video, tone: 'info', ratio: 'aspect-video', noun: 'Vidéo' },
}

/** DONNÉE TEMPORAIRE : nombre de visuels provisoires affichés par onglet. */
const TEMP_ITEM_COUNT = 6

type Opened =
  { kind: 'placeholder'; tab: TabId; index: number } | { kind: 'post'; post: LocalPost }

/**
 * Onglets de contenu du profil avec grille de visuels. Mes publications créées sur cet appareil
 * ouvrent leur contenu ; les autres visuels sont provisoires et s'ouvrent en aperçu.
 */
export function ContentGrid() {
  const [tab, setTab] = useState<TabId>('publications')
  const [opened, setOpened] = useState<Opened | null>(null)
  const localPosts = useLocalStore(localPostsStore)
  const { icon, tone, ratio, noun } = tabStyles[tab]
  const isVideo = tab === 'videos'
  const mine = tab === 'publications' ? localPosts : []

  const title =
    opened?.kind === 'post'
      ? 'Ma publication'
      : opened
        ? `${tabStyles[opened.tab].noun} ${opened.index + 1}`
        : ''

  return (
    <section aria-label="Contenu du profil" className="space-y-3 pb-1">
      <FilterChips label="Type de contenu" items={tabs} value={tab} onChange={setTab} />

      <ul
        className={cn(
          'mx-4 grid gap-1 overflow-hidden rounded-[1.1rem] ring-1 ring-black/[0.05]',
          isVideo ? 'grid-cols-2' : 'grid-cols-3',
        )}
      >
        {mine.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              aria-label={`Ma publication : ${post.text.slice(0, 40) || 'photo'}`}
              onClick={() => {
                recordPostView(post.id)
                setOpened({ kind: 'post', post })
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
        {Array.from({ length: TEMP_ITEM_COUNT }, (_, index) => (
          <li key={`${tab}-${index}`}>
            <button
              type="button"
              aria-label={`${noun} ${index + 1}`}
              onClick={() => setOpened({ kind: 'placeholder', tab, index })}
              className="block w-full overflow-hidden"
            >
              <Media icon={icon} tone={tone} className={cn('w-full', ratio)} />
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet open={opened !== null} onClose={() => setOpened(null)} title={title}>
        {opened?.kind === 'post' ? (
          <>
            {opened.post.imageSrc ? (
              <img
                src={opened.post.imageSrc}
                alt="Photo de ma publication"
                className="max-h-96 w-full rounded-2xl object-cover"
              />
            ) : null}
            {opened.post.text ? (
              <p className="text-body whitespace-pre-line">{opened.post.text}</p>
            ) : null}
            <p className="text-caption text-muted-foreground">
              Publication enregistrée sur cet appareil.
            </p>
          </>
        ) : opened ? (
          <>
            <Media
              icon={tabStyles[opened.tab].icon}
              tone={tabStyles[opened.tab].tone}
              className="aspect-video w-full rounded-2xl"
            />
          </>
        ) : null}
      </BottomSheet>
    </section>
  )
}
