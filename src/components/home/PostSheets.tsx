import { Copy, EyeOff, Flag, Trash2, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocalStore } from '@/hooks/use-local-store'
import { useNow } from '@/hooks/use-now'
import {
  addComment,
  commentsStore,
  formatRelative,
  hidePost,
  removeLocalPost,
  reportedPostsStore,
  reportPost,
} from '@/lib/social-store'

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

function CommentsBody({ postId }: { postId: string }) {
  const all = useLocalStore(commentsStore)
  const now = useNow(60_000)
  const [text, setText] = useState('')
  const comments = all[postId] ?? []

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addComment(postId, trimmed, timestamp())
    setText('')
  }

  return (
    <>
      {comments.length === 0 ? (
        <p className="py-4 text-center text-body text-muted-foreground">
          Aucun commentaire de votre part pour l’instant.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl bg-muted px-3.5 py-2.5">
              <p className="text-caption font-bold">
                Vous · {formatRelative(comment.createdAt, now)}
              </p>
              <p className="text-body whitespace-pre-line">{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <Input
          aria-label="Votre commentaire"
          placeholder="Écrire un commentaire…"
          value={text}
          maxLength={300}
          onChange={(event) => setText(event.target.value)}
        />
        <Button type="submit" disabled={!text.trim()}>
          Envoyer
        </Button>
      </form>
      <p className="text-caption text-muted-foreground">
        Vos commentaires sont enregistrés sur cet appareil jusqu’à la connexion du
        serveur.
      </p>
    </>
  )
}

/** Commentaires d'une publication : voir les miens et en ajouter un. */
export function PostCommentsSheet({
  open,
  onClose,
  postId,
  authorName,
}: {
  open: boolean
  onClose: () => void
  postId: string
  authorName: string
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={`Commentaires · ${authorName}`}>
      <CommentsBody postId={postId} />
    </BottomSheet>
  )
}

function OptionRow({
  icon: Icon,
  label,
  onClick,
  danger,
  done,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  danger?: boolean
  done?: boolean
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={done}
        className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-body font-semibold hover:bg-muted disabled:opacity-60 ${danger ? 'text-destructive' : ''}`}
      >
        <Icon className="size-5" aria-hidden="true" />
        {label}
      </button>
    </li>
  )
}

/** Options d'une publication : copier, masquer, signaler (ou supprimer la mienne). */
export function PostOptionsSheet({
  open,
  onClose,
  postId,
  text,
  own,
}: {
  open: boolean
  onClose: () => void
  postId: string
  text: string
  /** Publication créée sur cet appareil : on peut la supprimer. */
  own: boolean
}) {
  const reported = useLocalStore(reportedPostsStore).includes(postId)
  const [notice, setNotice] = useState('')

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Texte copié.')
    } catch {
      setNotice('Impossible de copier sur cet appareil.')
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Options de la publication">
      <ul className="-mx-2">
        <OptionRow icon={Copy} label="Copier le texte" onClick={() => void copyText()} />
        <OptionRow
          icon={EyeOff}
          label="Masquer cette publication"
          onClick={() => {
            hidePost(postId)
            onClose()
          }}
        />
        {own ? (
          <OptionRow
            icon={Trash2}
            label="Supprimer ma publication"
            danger
            onClick={() => {
              removeLocalPost(postId)
              onClose()
            }}
          />
        ) : (
          <OptionRow
            icon={Flag}
            label={reported ? 'Signalement enregistré' : 'Signaler la publication'}
            danger
            done={reported}
            onClick={() => {
              reportPost(postId)
              setNotice(
                'Signalement enregistré sur cet appareil : il sera transmis à la modération quand le serveur sera connecté.',
              )
            }}
          />
        )}
      </ul>
      <p role="status" className="text-caption text-muted-foreground empty:hidden">
        {notice}
      </p>
    </BottomSheet>
  )
}
