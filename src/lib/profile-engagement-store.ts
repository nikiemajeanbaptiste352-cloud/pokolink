/**
 * Pont profil privé ↔ public (frontend only).
 *
 * - Visites de la page publique → stats / courbe d’activité côté privé
 * - Vues des publications → détail « Par publication »
 * - Abonnements locaux (`follow-store`) → delta d’abonnés affiché sur le public
 *
 * À remplacer par l’API : le serveur restera la source de vérité.
 */
import { createLocalStore } from '@/lib/local-store'

export interface ProfileEngagement {
  /** Visites par @handle puis jour `YYYY-MM-DD`. */
  visitsByHandleDay: Record<string, Record<string, number>>
  /** Vues cumulées par id de publication locale. */
  postViews: Record<string, number>
  /** Variation d’abonnés par @handle (suivi / unfollow locaux). */
  followerDelta: Record<string, number>
}

const EMPTY: ProfileEngagement = {
  visitsByHandleDay: {},
  postViews: {},
  followerDelta: {},
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseCounts(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {}
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      out[key] = Math.floor(value)
    }
  }
  return out
}

function parseNestedCounts(raw: unknown): Record<string, Record<string, number>> {
  if (!isRecord(raw)) return {}
  const out: Record<string, Record<string, number>> = {}
  for (const [key, value] of Object.entries(raw)) {
    const nested = parseCounts(value)
    if (Object.keys(nested).length > 0) out[key] = nested
  }
  return out
}

export const profileEngagementStore = createLocalStore<ProfileEngagement>(
  'africonnect.profile-engagement.v1',
  (raw) => {
    if (!isRecord(raw)) return { ...EMPTY }
    return {
      visitsByHandleDay: parseNestedCounts(raw.visitsByHandleDay),
      postViews: parseCounts(raw.postViews),
      followerDelta: parseCounts(raw.followerDelta),
    }
  },
)

function dayKey(at = Date.now()): string {
  const d = new Date(at)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Enregistre une visite de page publique créateur. */
export function recordProfileVisit(handle: string) {
  const clean = handle.replace(/^@/, '')
  if (!clean) return
  const state = profileEngagementStore.get()
  const byDay = { ...(state.visitsByHandleDay[clean] ?? {}) }
  const key = dayKey()
  byDay[key] = (byDay[key] ?? 0) + 1
  profileEngagementStore.set({
    ...state,
    visitsByHandleDay: { ...state.visitsByHandleDay, [clean]: byDay },
  })
}

/** Enregistre une vue de publication (grille publique ou privée). */
export function recordPostView(postId: string) {
  if (!postId) return
  const state = profileEngagementStore.get()
  profileEngagementStore.set({
    ...state,
    postViews: {
      ...state.postViews,
      [postId]: (state.postViews[postId] ?? 0) + 1,
    },
  })
}

/** Applique +1 / −1 abonné après un suivi local sur `creator:handle`. */
export function applyFollowerDelta(handle: string, delta: 1 | -1) {
  const clean = handle.replace(/^@/, '')
  if (!clean) return
  const state = profileEngagementStore.get()
  const next = Math.max(0, (state.followerDelta[clean] ?? 0) + delta)
  profileEngagementStore.set({
    ...state,
    followerDelta: { ...state.followerDelta, [clean]: next },
  })
}

export function getFollowerDelta(handle: string): number {
  return profileEngagementStore.get().followerDelta[handle.replace(/^@/, '')] ?? 0
}

export function getPostViewCount(postId: string): number {
  return profileEngagementStore.get().postViews[postId] ?? 0
}

/** Série des 7 derniers jours : visites (vues) pour un handle. */
export function getVisitSeries(
  handle: string,
  days = 7,
): readonly { key: string; label: string; views: number }[] {
  const clean = handle.replace(/^@/, '')
  const byDay = profileEngagementStore.get().visitsByHandleDay[clean] ?? {}
  const labels = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
  const series: { key: string; label: string; views: number }[] = []
  const now = Date.now()
  for (let i = days - 1; i >= 0; i -= 1) {
    const at = now - i * 86_400_000
    const key = dayKey(at)
    const label = labels[new Date(at).getDay()] ?? key
    series.push({ key, label, views: byDay[key] ?? 0 })
  }
  return series
}
