/** Publications d’un Canal Pro (fil type Telegram). */

export interface LearnCanalPost {
  id: string
  canalId: string
  /** Texte du message (broadcast). */
  text: string
  createdAt: number
  /** Compteur d’affichages (démo). */
  views: number
  /** Image optionnelle (URL ou data-URL). */
  imageSrc?: string
}
