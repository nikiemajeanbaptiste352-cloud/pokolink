import { Clapperboard, Pencil, Trash2, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { FlashMessage } from '@/components/pro/shared'
import { EventPoster } from '@/components/studio/EventPoster'
import { EventPreview } from '@/components/studio/EventPreview'
import { EventResults } from '@/components/studio/EventResults'
import { DetailRow, StudioSection } from '@/components/studio/parts'
import { StudioStatusPill } from '@/components/studio/StudioStatusPill'
import { Button, buttonVariants } from '@/components/ui/button'
import { useFlash } from '@/hooks/use-flash'
import { useStudioEvent } from '@/hooks/use-studio'
import { formatNumber, formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import {
  canDelete,
  canWithdraw,
  formatDuration,
  formatFileSize,
  formatHashtags,
  getEndsAt,
  getEventTitle,
  getMarketTitle,
  getMaxCollection,
  isEditable,
  STUDIO_KINDS,
  STUDIO_STATUS,
} from '@/lib/studio'
import { deleteStudioDraft, withdrawStudioEvent } from '@/lib/studio-store'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

interface TimelineStep {
  label: string
  at: number
  /** Étape déjà passée ou prévue. */
  planned?: boolean
}

/** Étapes datées de la vie de l'événement, de la création à la fin. */
function buildTimeline(event: StudioEvent): TimelineStep[] {
  const steps: TimelineStep[] = [{ label: 'Brouillon créé', at: event.createdAt }]
  if (event.submittedAt) {
    steps.push({ label: 'Envoyé pour validation', at: event.submittedAt })
  }
  if (event.reviewedAt) {
    steps.push({
      label:
        event.status === 'rejected' ? 'Refusé par AfriConnect' : 'Validé par AfriConnect',
      at: event.reviewedAt,
    })
  }
  const validated =
    event.status === 'scheduled' ||
    event.status === 'live' ||
    event.status === 'ended' ||
    event.status === 'suspended'
  if (validated) {
    const started = event.status !== 'scheduled'
    steps.push({
      label: started ? 'Début' : 'Début prévu',
      at: event.startsAt,
      planned: !started,
    })
    steps.push({
      label: event.status === 'ended' ? 'Fin' : 'Fin prévue',
      at: getEndsAt(event),
      planned: event.status !== 'ended',
    })
  }
  return steps
}

export function StudioEventPage() {
  const { eventId } = useParams()
  const event = useStudioEvent(eventId)
  const navigate = useNavigate()
  const location = useLocation()
  const { message: flashed, flash } = useFlash()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const arrivalFlash =
    typeof (location.state as { flash?: unknown } | null)?.flash === 'string'
      ? (location.state as { flash: string }).flash
      : ''

  const back = <BackLink to={paths.studioTab('evenements')} label="Mes événements" />

  if (!event) {
    return (
      <>
        <PageHeader title="Événement" leading={back} />
        <EmptyState
          icon={Clapperboard}
          tone="violet"
          title="Événement introuvable"
          description="Cet événement n’existe pas ou a été supprimé."
          action={
            <Link to={paths.studioTab('evenements')} className={buttonVariants()}>
              Mes événements
            </Link>
          }
        />
      </>
    )
  }

  const status = STUDIO_STATUS[event.status]
  const collection = getMaxCollection(event)
  const timeline = buildTimeline(event)

  function withdraw(target: StudioEvent) {
    if (withdrawStudioEvent(target.id, Date.now())) {
      flash('Demande retirée : l’événement est redevenu un brouillon.')
    }
  }

  function remove(target: StudioEvent) {
    if (deleteStudioDraft(target.id)) {
      navigate(paths.studioTab('evenements'), { replace: true })
    }
  }

  return (
    <>
      <PageHeader title={STUDIO_KINDS[event.kind].label} leading={back} />

      <div className="space-y-6 pt-4 pb-8">
        <FlashMessage message={flashed || arrivalFlash} />

        <section className="space-y-3 px-4">
          <EventPoster
            kind={event.kind}
            cover={event.cover}
            seed={event.caption}
            className="aspect-video w-full rounded-2xl"
          />
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-title leading-snug font-extrabold">
              {getEventTitle(event)}
            </h2>
            <StudioStatusPill status={event.status} />
          </div>
          <p className="text-body text-muted-foreground">
            {STUDIO_KINDS[event.kind].short}
            {event.kind === 'factor' ? ` · ${getMarketTitle(event)}` : ''}
          </p>
          {event.hashtags.length > 0 ? (
            <p className="text-body text-brand">{formatHashtags(event.hashtags)}</p>
          ) : null}
        </section>

        <section
          aria-label="État de l’événement"
          className="mx-4 space-y-2 rounded-xl bg-muted p-3.5"
        >
          <p className="text-body font-bold">{status.label}</p>
          <p className="text-body">{status.message}</p>
          {event.reason ? (
            <p className="rounded-lg bg-background p-3 text-body">
              <strong>Motif :</strong> {event.reason}
            </p>
          ) : null}
        </section>

        {isEditable(event) || canWithdraw(event) || canDelete(event) ? (
          <div className="grid gap-3 px-4">
            {isEditable(event) ? (
              <Link
                to={paths.studioEventEdit(event.id)}
                className={buttonVariants({ size: 'lg' })}
              >
                <Pencil aria-hidden="true" />
                {event.status === 'rejected'
                  ? 'Corriger et renvoyer'
                  : 'Compléter et envoyer'}
              </Link>
            ) : null}
            {canWithdraw(event) ? (
              <Button size="lg" variant="outline" onClick={() => withdraw(event)}>
                <Undo2 aria-hidden="true" />
                Retirer la demande
              </Button>
            ) : null}
            {canDelete(event) ? (
              <Button size="lg" variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 aria-hidden="true" />
                Supprimer le brouillon
              </Button>
            ) : null}
          </div>
        ) : null}

        {event.stats ? (
          <StudioSection
            title="Résultats"
            description="Chiffres fournis par AfriConnect."
          >
            <EventResults event={event} />
          </StudioSection>
        ) : null}

        <StudioSection title="Paramètres">
          <dl className="divide-y rounded-xl border bg-card px-3.5">
            <DetailRow label="Type">{STUDIO_KINDS[event.kind].label}</DetailRow>
            <DetailRow label="Début">{formatDateTime(event.startsAt)}</DetailRow>
            <DetailRow label="Durée">{formatDuration(event.durationHours)}</DetailRow>
            <DetailRow label="Fin">{formatDateTime(getEndsAt(event))}</DetailRow>
            {event.kind === 'coins' ? (
              <>
                <DetailRow label="Nombre de coins">
                  {event.maxCoins ? formatNumber(event.maxCoins) : 'À indiquer'}
                </DetailRow>
                <DetailRow label="Prix initial d’un coin">
                  {event.coinPrice ? formatPrice(event.coinPrice) : 'À indiquer'}
                </DetailRow>
                {collection !== null ? (
                  <DetailRow label="Capacité d’achat">
                    {formatPrice(collection)}
                  </DetailRow>
                ) : null}
              </>
            ) : (
              <DetailRow label="Facteur de départ">1,000 (neutre)</DetailRow>
            )}
            <DetailRow label="Vidéo">
              {event.videoName ? (
                <>
                  {event.videoName}
                  <span className="block text-caption font-normal text-muted-foreground">
                    {formatFileSize(event.videoSize)}
                  </span>
                </>
              ) : (
                'Aucune vidéo'
              )}
            </DetailRow>
          </dl>
        </StudioSection>

        <StudioSection title="Suivi">
          <ol className="space-y-0 rounded-xl border bg-card px-3.5">
            {timeline.map((step, index) => (
              <li
                key={`${step.label}-${step.at}`}
                className={
                  index === timeline.length - 1
                    ? 'flex items-baseline justify-between gap-3 py-2.5'
                    : 'flex items-baseline justify-between gap-3 border-b py-2.5'
                }
              >
                <span
                  className={
                    step.planned
                      ? 'text-body text-muted-foreground'
                      : 'text-body font-semibold'
                  }
                >
                  {step.label}
                </span>
                <span className="text-right text-caption text-muted-foreground">
                  {formatDateTime(step.at)}
                </span>
              </li>
            ))}
          </ol>
        </StudioSection>

        <StudioSection
          title="Aperçu pour les participants"
          description="Ce que les participants voient. Les valeurs de calcul viennent d’AfriConnect."
        >
          <EventPreview
            data={{
              kind: event.kind,
              caption: event.caption,
              hashtags: event.hashtags,
              cover: event.cover,
              startsAt: event.startsAt,
              durationHours: event.durationHours,
              maxCoins: event.maxCoins,
              coinPrice: event.coinPrice,
            }}
          />
        </StudioSection>
      </div>

      <BottomSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer ce brouillon ?"
        subtitle="Cette action est définitive. Les événements déjà envoyés ne peuvent pas être supprimés."
      >
        <div className="grid gap-3">
          <Button
            size="lg"
            variant="destructive"
            onClick={() => {
              setConfirmDelete(false)
              remove(event)
            }}
          >
            Supprimer le brouillon
          </Button>
          <Button size="lg" variant="outline" onClick={() => setConfirmDelete(false)}>
            Garder
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
