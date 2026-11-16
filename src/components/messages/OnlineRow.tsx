import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { paths } from '@/routes/paths'
import type { Conversation } from '@/types/messages'

interface OnlineRowProps {
  people: readonly Conversation[]
}

/** Rangée « En ligne (n) » : contacts actuellement connectés. */
export function OnlineRow({ people }: OnlineRowProps) {
  if (people.length === 0) return null

  return (
    <section aria-label={`En ligne, ${people.length} contacts`}>
      <h2 className="px-4 pt-3 text-sm font-semibold text-muted-foreground">
        En ligne ({people.length})
      </h2>
      <ul className="flex scrollbar-none gap-3 overflow-x-auto px-4 py-3">
        {people.map((person) => (
          <li key={person.id} className="shrink-0">
            <Link
              to={paths.conversation(person.id)}
              aria-label={`Discuter avec ${person.name}`}
              className="flex w-[4.5rem] flex-col items-center gap-1 rounded-xl"
            >
              <Avatar name={person.name} src={person.avatarSrc} size="xl" online />
              <span className="w-full truncate text-center text-caption text-muted-foreground">
                {person.name.split(' ')[0]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
