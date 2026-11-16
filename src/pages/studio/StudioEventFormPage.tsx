import { Clapperboard, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import {
  StudioEventForm,
  type StudioFormOutcome,
} from '@/components/studio/StudioEventForm'
import { buttonVariants } from '@/components/ui/button'
import { useStudioEvent } from '@/hooks/use-studio'
import { isEditable } from '@/lib/studio'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

/** Création (`/studio/evenements/nouveau`) ou modification d'un événement du créateur. */
export function StudioEventFormPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const event = useStudioEvent(eventId)
  const editing = eventId !== undefined

  const backTo = event ? paths.studioEvent(event.id) : paths.studioTab('evenements')

  function finished(saved: StudioEvent, outcome: StudioFormOutcome) {
    navigate(paths.studioEvent(saved.id), {
      replace: true,
      state: {
        flash:
          outcome === 'submitted'
            ? 'Événement envoyé pour validation (démonstration).'
            : 'Brouillon enregistré.',
      },
    })
  }

  if (editing && (!event || !isEditable(event))) {
    return (
      <>
        <PageHeader
          title="Événement"
          leading={<BackLink to={paths.studioTab('evenements')} label="Mes événements" />}
        />
        <EmptyState
          icon={Clapperboard}
          tone="violet"
          title={event ? 'Événement non modifiable' : 'Événement introuvable'}
          description={
            event
              ? 'Seuls les brouillons et les événements refusés peuvent être modifiés. Retirez la demande en revue pour modifier un événement envoyé.'
              : 'Cet événement n’existe pas ou a été supprimé.'
          }
          action={
            <Link
              to={event ? paths.studioEvent(event.id) : paths.studioTab('evenements')}
              className={buttonVariants()}
            >
              {event ? 'Voir l’événement' : 'Mes événements'}
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={editing ? 'Modifier l’événement' : 'Nouvel événement'}
        leading={
          <BackLink to={backTo} label={editing ? 'Événement' : 'Creator Studio'} />
        }
      />

      {event?.status === 'rejected' && event.reason ? (
        <div
          role="note"
          className="mx-4 mt-4 flex items-start gap-3 rounded-xl bg-destructive/10 p-3.5"
        >
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-body">
            <strong>Motif du refus.</strong> {event.reason}
          </p>
        </div>
      ) : null}

      <StudioEventForm
        key={event?.id ?? 'new'}
        {...(event ? { event } : {})}
        initialKind={searchParams.get('type') === 'coins' ? 'coins' : 'factor'}
        onFinished={finished}
        onCancel={() => navigate(backTo)}
      />
    </>
  )
}
