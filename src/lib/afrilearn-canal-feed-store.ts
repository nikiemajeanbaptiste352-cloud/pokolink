/**
 * Fil de publications Canal Pro (style Telegram).
 * STOCKAGE TEMPORAIRE localStorage — à remplacer par l’API.
 */
import { createId } from '@/lib/ids'
import { createLocalStore } from '@/lib/local-store'
import type { LearnCanalPost } from '@/types/afrilearn-canal-feed'

interface FeedState {
  posts: LearnCanalPost[]
}

function seedPosts(): LearnCanalPost[] {
  const now = Date.now()
  const day = 86_400_000
  return [
    {
      id: 'seed-post-amadou-1',
      canalId: 'seed-canal-amadou',
      text: 'Bienvenue sur le Canal Maths Terminale 📐\n\nChaque semaine : un exercice corrigé + une méthode clé.',
      createdAt: now - 3 * day,
      views: 128,
    },
    {
      id: 'seed-post-amadou-2',
      canalId: 'seed-canal-amadou',
      text: 'Méthode du jour — Probabilités\n\n1) Dessiner l’arbre\n2) Écrire les branches\n3) Multiplier le long du chemin\n\nExo demain à 18h.',
      createdAt: now - 1 * day,
      views: 86,
    },
    {
      id: 'seed-post-amadou-3',
      canalId: 'seed-canal-amadou',
      text: 'Rappel : la session live de révision commence dans 2 h. Préparez vos questions.',
      createdAt: now - 2 * 3_600_000,
      views: 54,
    },
    {
      id: 'seed-post-aicha-1',
      canalId: 'seed-canal-aicha',
      text: 'Bienvenue sur Français BEPC · Aïcha ✍️\n\nIci : méthodes de dissertation, sujets commentés et oraux.',
      createdAt: now - 4 * day,
      views: 210,
    },
    {
      id: 'seed-post-aicha-2',
      canalId: 'seed-canal-aicha',
      text: 'Dissertation — plan type\n\nI. Analyse du sujet\nII. Problématique\nIII. Plan dialectique\n\nExemple détaillé en pièce jointe demain.',
      createdAt: now - day,
      views: 142,
    },
    {
      id: 'seed-post-aicha-3',
      canalId: 'seed-canal-aicha',
      text: 'Astuce oral : regardez le jury, respirez, puis commencez par reformuler la question.',
      createdAt: now - 5 * 3_600_000,
      views: 97,
    },
  ]
}

function isPost(value: unknown): value is LearnCanalPost {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Partial<LearnCanalPost>
  return (
    typeof p.id === 'string' &&
    typeof p.canalId === 'string' &&
    typeof p.text === 'string' &&
    typeof p.createdAt === 'number' &&
    typeof p.views === 'number'
  )
}

export const canalFeedStore = createLocalStore<FeedState>(
  'africonnect.afrilearn-canal-feed.v1',
  (raw) => {
    if (raw && typeof raw === 'object' && Array.isArray((raw as FeedState).posts)) {
      const posts = (raw as FeedState).posts.filter(isPost)
      if (posts.length > 0) return { posts }
    }
    return { posts: seedPosts() }
  },
)

export function listCanalPosts(canalId: string): readonly LearnCanalPost[] {
  return canalFeedStore
    .get()
    .posts.filter((p) => p.canalId === canalId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function addCanalPost(input: {
  canalId: string
  text: string
  imageSrc?: string
}): LearnCanalPost | undefined {
  const text = input.text.trim()
  if (!text) return undefined
  const post: LearnCanalPost = {
    id: createId(),
    canalId: input.canalId,
    text,
    createdAt: Date.now(),
    views: 1,
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
  }
  const state = canalFeedStore.get()
  canalFeedStore.set({ posts: [...state.posts, post] })
  return post
}
