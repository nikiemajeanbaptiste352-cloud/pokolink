/**
 * DONNÉES TEMPORAIRES : activité du profil (vues des publications, évolution des abonnés).
 * À remplacer par l'API (TanStack Query) : agrégats calculés côté serveur.
 */

export interface ProfileActivityPoint {
  /** Libellé court du jour (ex. « Lun »). */
  label: string
  /** Vues cumulées des publications ce jour-là. */
  views: number
  /** Nouveaux abonnés ce jour-là. */
  followers: number
}

export interface PostViewsStat {
  id: string
  /** Titre court de la publication. */
  title: string
  views: number
}

/** Évolution sur 7 jours : vues des posts et nouveaux abonnés. */
export const TEMP_PROFILE_ACTIVITY: readonly ProfileActivityPoint[] = [
  { label: 'Lun', views: 820, followers: 12 },
  { label: 'Mar', views: 1_140, followers: 18 },
  { label: 'Mer', views: 980, followers: 9 },
  { label: 'Jeu', views: 1_560, followers: 24 },
  { label: 'Ven', views: 2_100, followers: 31 },
  { label: 'Sam', views: 1_780, followers: 22 },
  { label: 'Dim', views: 1_320, followers: 15 },
]

/** Vues par publication récente (exemple). */
export const TEMP_POST_VIEWS: readonly PostViewsStat[] = [
  { id: 'p1', title: 'Conseils entrepreneurs', views: 4_820 },
  { id: 'p2', title: 'Marché local Dakar', views: 3_210 },
  { id: 'p3', title: 'Short · Astuce Wallet', views: 2_640 },
  { id: 'p4', title: 'Événement Creator', views: 1_980 },
  { id: 'p5', title: 'Portrait du jour', views: 1_250 },
]
