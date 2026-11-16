import { Search, UserCog } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusPill } from '@/components/pro/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/pro-labels'
import type { ChannelMember } from '@/types/pro'

interface CommunityTabProps {
  members: readonly ChannelMember[]
  onChange: (member: ChannelMember | null, id: string) => void
}

/** Liste des membres du canal, recherche et gestion (suspension, administrateur, exclusion). */
export function CommunityTab({ members, onChange }: CommunityTabProps) {
  const [query, setQuery] = useState('')
  const [managedId, setManagedId] = useState<string | null>(null)
  const [confirmingExclude, setConfirmingExclude] = useState(false)

  const normalized = query.trim().toLowerCase()
  const visible = normalized
    ? members.filter((member) => member.name.toLowerCase().includes(normalized))
    : members
  const managed = members.find((member) => member.id === managedId) ?? null

  function close() {
    setManagedId(null)
    setConfirmingExclude(false)
  }

  return (
    <section aria-label="Communauté" className="space-y-3">
      <div className="relative px-4">
        <label htmlFor="member-search" className="sr-only">
          Rechercher un membre
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-7 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="member-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un membre"
          className="pl-11"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun membre trouvé"
          description="Aucun membre ne correspond à cette recherche."
          className="py-8"
        />
      ) : (
        <ul className="divide-y border-y">
          {visible.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-bold">{member.name}</p>
                <p className="truncate text-caption text-muted-foreground">
                  Membre depuis le {formatDate(member.joinedAt)}
                </p>
                <div className="mt-1 flex gap-2">
                  {member.role === 'admin' ? (
                    <StatusPill>Administrateur</StatusPill>
                  ) : null}
                  {member.status === 'suspended' ? (
                    <StatusPill>Suspendu</StatusPill>
                  ) : null}
                </div>
              </div>
              <Button variant="outline" onClick={() => setManagedId(member.id)}>
                <UserCog aria-hidden="true" />
                Gérer
                <span className="sr-only"> : {member.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={managed !== null}
        onClose={close}
        title={managed?.name ?? 'Membre'}
        subtitle="Gestion du membre"
      >
        {managed ? (
          <div className="grid gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                onChange(
                  {
                    ...managed,
                    status: managed.status === 'active' ? 'suspended' : 'active',
                  },
                  managed.id,
                )
                close()
              }}
            >
              {managed.status === 'active'
                ? 'Suspendre le membre'
                : 'Réactiver le membre'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                onChange(
                  { ...managed, role: managed.role === 'admin' ? 'member' : 'admin' },
                  managed.id,
                )
                close()
              }}
            >
              {managed.role === 'admin'
                ? 'Retirer les droits d’administrateur'
                : 'Nommer administrateur'}
            </Button>
            {confirmingExclude ? (
              <div className="space-y-3 rounded-xl border border-destructive/40 p-3.5">
                <p className="text-body">Exclure {managed.name} du canal ?</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onChange(null, managed.id)
                      close()
                    }}
                  >
                    Oui, exclure
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmingExclude(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setConfirmingExclude(true)}
              >
                Exclure du canal
              </Button>
            )}
          </div>
        ) : null}
      </BottomSheet>
    </section>
  )
}
