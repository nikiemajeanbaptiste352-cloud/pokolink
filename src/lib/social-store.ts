/**
 * Activité sociale locale de l'accueil : mes publications, mes stories, les commentaires que
 * j'écris, les publications masquées et les stories vues.
 *
 * STOCKAGE TEMPORAIRE : tout reste sur cet appareil. Rien n'est publié aux autres utilisateurs
 * tant que l'API n'est pas branchée ; le serveur modérera et diffusera les contenus.
 */
import { createLocalStore } from '@/lib/local-store'

export interface LocalPost {
  id: string
  text: string
  imageSrc?: string
  /** Lien de partenariat collé à la publication. */
  partnershipLink?: string
  createdAt: number
}

export interface LocalStory {
  id: string
  text: string
  imageSrc?: string
  createdAt: number
}

export interface LocalComment {
  id: string
  text: string
  createdAt: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isContent(value: unknown): value is LocalPost {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.createdAt === 'number' &&
    (value.imageSrc === undefined || typeof value.imageSrc === 'string') &&
    (value.partnershipLink === undefined || typeof value.partnershipLink === 'string')
  )
}

function parseList<T>(raw: unknown, guard: (value: unknown) => value is T): readonly T[] {
  return Array.isArray(raw) ? raw.filter(guard) : []
}

function parseStrings(raw: unknown): readonly string[] {
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : []
}

export const localPostsStore = createLocalStore<readonly LocalPost[]>(
  'africonnect.home-posts.v1',
  (raw) => parseList(raw, isContent),
)

export const localStoriesStore = createLocalStore<readonly LocalStory[]>(
  'africonnect.home-stories.v1',
  (raw) => parseList(raw, isContent),
)

export const commentsStore = createLocalStore<Record<string, readonly LocalComment[]>>(
  'africonnect.home-comments.v1',
  (raw) => {
    const result: Record<string, readonly LocalComment[]> = {}
    if (!isRecord(raw)) return result
    for (const [postId, list] of Object.entries(raw)) {
      result[postId] = parseList(
        list,
        (v): v is LocalComment =>
          isRecord(v) &&
          typeof v.id === 'string' &&
          typeof v.text === 'string' &&
          typeof v.createdAt === 'number',
      )
    }
    return result
  },
)

export const hiddenPostsStore = createLocalStore<readonly string[]>(
  'africonnect.home-hidden.v1',
  parseStrings,
)

export const seenStoriesStore = createLocalStore<readonly string[]>(
  'africonnect.home-stories-seen.v1',
  parseStrings,
)

export const reportedPostsStore = createLocalStore<readonly string[]>(
  'africonnect.home-reported.v1',
  parseStrings,
)

export function addLocalPost(
  input: { text: string; imageSrc?: string; partnershipLink?: string },
  now: number,
) {
  const post: LocalPost = {
    id: `lp-${now}`,
    text: input.text,
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
    ...(input.partnershipLink ? { partnershipLink: input.partnershipLink } : {}),
    createdAt: now,
  }
  localPostsStore.set([post, ...localPostsStore.get()])
}

export function removeLocalPost(id: string) {
  localPostsStore.set(localPostsStore.get().filter((post) => post.id !== id))
}

export function addLocalStory(input: { text: string; imageSrc?: string }, now: number) {
  const story: LocalStory = {
    id: `ls-${now}`,
    text: input.text,
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
    createdAt: now,
  }
  localStoriesStore.set([story, ...localStoriesStore.get()])
}

export function addComment(postId: string, text: string, now: number) {
  const all = commentsStore.get()
  const comment: LocalComment = { id: `lc-${now}`, text, createdAt: now }
  commentsStore.set({ ...all, [postId]: [...(all[postId] ?? []), comment] })
}

function addToList(store: typeof hiddenPostsStore, id: string) {
  const list = store.get()
  if (!list.includes(id)) store.set([...list, id])
}

export const hidePost = (id: string) => addToList(hiddenPostsStore, id)
export const reportPost = (id: string) => addToList(reportedPostsStore, id)
export const markStorySeen = (id: string) => addToList(seenStoriesStore, id)

/** « À l'instant », « 5 min », « 2 h », « 3 j ». */
export function formatRelative(at: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - at) / 60_000))
  if (minutes < 1) return 'À l’instant'
  if (minutes < 60) return `${minutes} min`
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h`
  return `${Math.floor(minutes / (24 * 60))} j`
}
