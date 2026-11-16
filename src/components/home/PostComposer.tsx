import { Image } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { ComposeSheet } from '@/components/home/ComposeSheet'
import { addLocalPost } from '@/lib/social-store'
import { paths } from '@/routes/paths'

interface PostComposerProps {
  userName: string
  firstName: string
  avatarSrc?: string | undefined
}

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

/** Zone « À quoi pensez-vous ? » — style Facebook, ouvre la création. */
export function PostComposer({ userName, firstName, avatarSrc }: PostComposerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="home-composer flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
      <Link
        to={paths.profile}
        aria-label="Voir mon profil"
        className="shrink-0 rounded-full"
      >
        <Avatar name={userName} src={avatarSrc} size="md" />
      </Link>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="home-composer-field h-10 min-w-0 flex-1 truncate rounded-full bg-muted px-4 text-left text-[15px] text-muted-foreground hover:bg-muted/80"
      >
        À quoi pensez-vous, {firstName} ?
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ajouter une photo"
        className="grid size-10 shrink-0 place-items-center rounded-full text-[#45bd62] transition-colors hover:bg-muted"
      >
        <Image className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <ComposeSheet
        open={open}
        onClose={() => setOpen(false)}
        mode="post"
        onSubmit={(value) => {
          addLocalPost(value, timestamp())
          setOpen(false)
        }}
      />
    </div>
  )
}
