import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { paths } from '@/routes/paths'
import type { LearnAuthor } from '@/types/learn'

import { ROLE_LABEL } from './learn-utils'

interface AuthorLineProps {
  author: LearnAuthor
  timeLabel: string
  size?: 'sm' | 'md'
}

/** Auteur (lien vers sa page publique), rôle éventuel (modérateur, administrateur) et ancienneté. */
export function AuthorLine({ author, timeLabel, size = 'md' }: AuthorLineProps) {
  const role = ROLE_LABEL[author.role]
  return (
    <Link
      to={paths.learnMember(author.handle)}
      className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg hover:opacity-80"
    >
      <Avatar name={author.name} src={author.avatarSrc} size={size} />
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5 text-body font-bold">
          <span className="truncate">{author.id === 'me' ? 'Vous' : author.name}</span>
          {role ? (
            <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-caption font-semibold text-accent-foreground">
              {role}
            </span>
          ) : null}
        </p>
        <p className="truncate text-caption text-muted-foreground">
          @{author.handle} · profil public · {timeLabel}
        </p>
      </div>
    </Link>
  )
}
