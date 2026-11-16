import {
  Download,
  FileImage,
  FileText,
  Flag,
  Flame,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { formatCount } from '@/lib/format'
import { shareOrCopy } from '@/lib/share'
import { paths } from '@/routes/paths'
import type { LearnDocument, LearnFileType } from '@/types/learn'

import { AuthorLine } from './AuthorLine'
import { DOCUMENT_KIND_LABEL, FILE_TYPE_LABEL, formatFileSize } from './learn-utils'

const FILE_ICON: Record<LearnFileType, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  image: FileImage,
}

interface DocumentCardProps {
  document: LearnDocument
  /** Absent : pas de bouton « Signaler » (ses propres documents). */
  onReport?: ((document: LearnDocument) => void) | undefined
}

/**
 * Document de la bibliothèque. Le serveur vérifie l'accès, compte le téléchargement et
 * autorise le fichier ; aucun fichier n'est stocké dans cette démonstration.
 */
export function DocumentCard({ document, onReport }: DocumentCardProps) {
  const [notice, setNotice] = useState('')
  const Icon = FILE_ICON[document.fileType]

  async function share() {
    const url = `${window.location.origin}${paths.learnFeed(document.levelId)}?onglet=bibliotheque`
    const result = await shareOrCopy(url, document.title)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      aria-label={document.title}
      className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-body leading-snug font-bold">{document.title}</h3>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">
              {DOCUMENT_KIND_LABEL[document.kind]}
            </span>
            <span>
              {FILE_TYPE_LABEL[document.fileType]} · {formatFileSize(document.fileSize)}
            </span>
            {document.isPopular ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-foreground">
                <Flame className="size-3.5" aria-hidden="true" />
                Populaire
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <p className="text-body text-muted-foreground">{document.description}</p>

      <div className="flex items-center justify-between gap-3">
        <AuthorLine author={document.author} timeLabel={document.timeLabel} size="sm" />
        <p className="shrink-0 text-caption text-muted-foreground">
          {formatCount(document.downloadsCount)} téléchargements
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="min-w-0 flex-1"
          onClick={() =>
            setNotice(
              'Téléchargement indisponible dans cette démonstration : aucun fichier n’est stocké.',
            )
          }
        >
          <Download aria-hidden="true" />
          Télécharger
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Partager : ${document.title}`}
          onClick={() => void share()}
        >
          <Share2 aria-hidden="true" />
        </Button>
        {onReport ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Signaler : ${document.title}`}
            onClick={() => onReport(document)}
          >
            <Flag aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p role="status" className="text-caption text-muted-foreground empty:hidden">
        {notice}
      </p>
    </article>
  )
}
