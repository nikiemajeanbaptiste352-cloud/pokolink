import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Pencil,
  Send,
  Users,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Media } from '@/components/common/Media'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { PartnershipLinkField } from '@/components/form/PartnershipLinkField'
import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getEventPath } from '@/lib/event-links'
import { EVENT_KINDS, EVENT_STATE_LABEL } from '@/lib/events'
import { formatCount } from '@/lib/format'
import { getProEventState, PARTICIPATION_LABEL, toLocalInput } from '@/lib/pro-labels'
import { normalizePartnershipLink } from '@/lib/partnership-link'
import { EVENT_KIND_IDS, eventSchema, type EventValues } from '@/lib/pro-schemas'
import { createId } from '@/lib/ids'
import { cn } from '@/lib/utils'
import type { ProEvent, ProEventKind } from '@/types/pro'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

interface EventViewProps {
  title: string
  kind: ProEventKind
  cover: string
  startsAt: number
  endsAt: number
  location: string
  description?: string
  /** Pastille posée sur la couverture (état de l'événement). */
  badge?: ReactNode
  /** Ligne sous le lieu (participants, organisateur). */
  meta?: ReactNode
  /** Pied de carte : boutons d'action pleine largeur. */
  footer?: ReactNode
  className?: string
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' })
const whenFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Carte d'événement façon réseau social : couverture pleine largeur avec pastille de date,
 * date en couleur d'accent, nom, lieu, participants et boutons d'action pleine largeur.
 */
function EventView({
  title,
  kind,
  cover,
  startsAt,
  endsAt,
  location,
  description,
  badge,
  meta,
  footer,
  className,
}: EventViewProps) {
  const kindMeta = EVENT_KINDS[kind]
  const hasDates = Number.isFinite(startsAt) && Number.isFinite(endsAt)
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card',
        className,
      )}
    >
      <div className="relative">
        <Media
          src={cover || undefined}
          alt=""
          icon={kindMeta.icon}
          tone={kindMeta.tone}
          className="aspect-video w-full"
        />
        {hasDates ? (
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 w-12 overflow-hidden rounded-xl bg-card text-center shadow-md"
          >
            <p className="bg-destructive py-0.5 text-caption leading-4 font-bold text-white uppercase">
              {monthFormatter.format(startsAt).replace('.', '')}
            </p>
            <p className="py-0.5 text-title leading-6 font-extrabold">
              {dayFormatter.format(startsAt)}
            </p>
          </div>
        ) : null}
        {badge ? <div className="absolute top-3 right-3">{badge}</div> : null}
      </div>
      <div className="flex-1 space-y-1 p-4">
        <p className="text-caption font-bold tracking-wide text-brand uppercase">
          {hasDates ? whenFormatter.format(startsAt) : 'Dates à définir'}
        </p>
        <h3 className="text-title leading-snug font-extrabold">
          {title || 'Nom de l’événement'}
        </h3>
        <p className="flex items-start gap-1.5 text-body text-muted-foreground">
          <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0">{location || 'Lieu à définir'}</span>
        </p>
        <p className="text-caption text-muted-foreground">{kindMeta.label}</p>
        {meta}
        {description ? <p className="pt-1 text-body">{description}</p> : null}
      </div>
      {footer ? <div className="border-t p-3">{footer}</div> : null}
    </div>
  )
}

interface ProEventCardProps {
  event: ProEvent
  now: number
  onEdit: (event: ProEvent) => void
  onPublish: (event: ProEvent) => void
  onRequest: (event: ProEvent) => void
}

/** Carte d'un événement avec le statut de participation et l'action utile. */
export function ProEventCard({
  event,
  now,
  onEdit,
  onPublish,
  onRequest,
}: ProEventCardProps) {
  const state = getProEventState(event, now)
  const canRequest = !event.mine && event.participation === 'none' && state !== 'ended'
  const openPath = event.published ? getEventPath(event.id) : undefined
  const status = event.mine
    ? event.published
      ? 'Organisateur'
      : 'Brouillon'
    : PARTICIPATION_LABEL[event.participation]

  return (
    <article className="h-full">
      <EventView
        {...event}
        description={undefined}
        className="h-full"
        badge={<StatusPill className="shadow-sm">{EVENT_STATE_LABEL[state]}</StatusPill>}
        meta={
          <>
            <p className="flex items-center gap-1.5 pt-1 text-caption text-muted-foreground">
              <Users className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                {event.participants !== null
                  ? `${formatCount(event.participants)} personnes participent · `
                  : ''}
                {status}
              </span>
            </p>
            <p className="text-caption text-muted-foreground">
              Organisé par {event.mine ? 'vous' : event.organizer}
            </p>
          </>
        }
        footer={
          openPath || event.mine || canRequest ? (
            <div className="flex flex-wrap gap-2 [&>*]:min-w-0 [&>*]:flex-1">
              {openPath ? (
                <Link
                  to={openPath}
                  className={buttonVariants({ className: 'inline-flex justify-center' })}
                >
                  <ExternalLink aria-hidden="true" />
                  Ouvrir<span className="sr-only"> : {event.title}</span>
                </Link>
              ) : null}
              {event.mine ? (
                <>
                  {event.published ? null : (
                    <Button onClick={() => onPublish(event)}>
                      <Send aria-hidden="true" />
                      Créer<span className="sr-only"> l’événement : {event.title}</span>
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => onEdit(event)}>
                    <Pencil aria-hidden="true" />
                    Modifier<span className="sr-only"> : {event.title}</span>
                  </Button>
                </>
              ) : null}
              {canRequest ? (
                <Button onClick={() => onRequest(event)}>
                  Demander à participer<span className="sr-only"> : {event.title}</span>
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />
    </article>
  )
}
interface EventFormSheetProps {
  open: boolean
  event: ProEvent | null
  now: number
  organizer: string
  onClose: () => void
  onSave: (event: ProEvent, published: boolean) => void
}

/** Création ou modification d'un événement : Enregistrer, Prévisualiser, Créer. */
export function EventFormSheet({
  open,
  event,
  now,
  organizer,
  onClose,
  onSave,
}: EventFormSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={event ? 'Modifier l’événement' : 'Créer un événement'}
      subtitle="Market Event : visible des participants une fois créé."
    >
      <EventForm
        event={event}
        now={now}
        organizer={organizer}
        onSave={onSave}
        onCancel={onClose}
      />
    </BottomSheet>
  )
}

function EventForm({
  event,
  now,
  organizer,
  onSave,
  onCancel,
}: {
  event: ProEvent | null
  now: number
  organizer: string
  onSave: EventFormSheetProps['onSave']
  onCancel: () => void
}) {
  const [previewing, setPreviewing] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      kind: event?.kind ?? 'community',
      description: event?.description ?? '',
      cover: event?.cover ?? '',
      startsAt: toLocalInput(event?.startsAt ?? now + DAY),
      endsAt: toLocalInput(event?.endsAt ?? now + DAY + 2 * HOUR),
      location: event?.location ?? '',
      extra: event?.extra ?? '',
      partnershipLink: event?.partnershipLink ?? '',
    },
  })
  const watched = useWatch({ control })

  function submit(published: boolean) {
    return handleSubmit((values) => {
      onSave(
        {
          id: event?.id ?? createId(),
          title: values.title,
          kind: values.kind,
          description: values.description,
          cover: values.cover,
          startsAt: new Date(values.startsAt).getTime(),
          endsAt: new Date(values.endsAt).getTime(),
          location: values.location,
          extra: values.extra,
          organizer,
          mine: true,
          published: published || (event?.published ?? false),
          participation: 'none',
          participants: event?.participants ?? null,
          ...(values.partnershipLink.trim()
            ? {
                partnershipLink:
                  normalizePartnershipLink(values.partnershipLink) ??
                  values.partnershipLink.trim(),
              }
            : {}),
        },
        published,
      )
    })
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5">
      <Field id="event-title" label="Nom de l’événement" error={errors.title?.message}>
        {(a11y) => <Input {...a11y} {...register('title')} maxLength={80} />}
      </Field>

      <Field id="event-kind" label="Catégorie">
        {(a11y) => (
          <Select {...a11y} {...register('kind')}>
            {EVENT_KIND_IDS.map((id) => (
              <option key={id} value={id}>
                {EVENT_KINDS[id].label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="event-description"
        label="Description"
        error={errors.description?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('description')} maxLength={500} />}
      </Field>

      <Controller
        control={control}
        name="cover"
        render={({ field }) => (
          <ImageField
            label="Image de couverture"
            value={field.value}
            onChange={field.onChange}
            icon={CalendarDays}
            tone="info"
            maxSize={900}
            shape="wide"
          />
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="event-start" label="Début" error={errors.startsAt?.message}>
          {(a11y) => <Input {...a11y} {...register('startsAt')} type="datetime-local" />}
        </Field>
        <Field id="event-end" label="Fin" error={errors.endsAt?.message}>
          {(a11y) => <Input {...a11y} {...register('endsAt')} type="datetime-local" />}
        </Field>
      </div>

      <Field id="event-location" label="Lieu" error={errors.location?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register('location')}
            maxLength={100}
            placeholder="Ex. Ouagadougou, ou En ligne"
          />
        )}
      </Field>

      <Field
        id="event-extra"
        label="Informations complémentaires"
        optional
        error={errors.extra?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('extra')} maxLength={300} />}
      </Field>

      <PartnershipLinkField
        id="event-partnership"
        inputProps={register('partnershipLink')}
        error={errors.partnershipLink?.message}
      />

      {previewing ? (
        <div className="space-y-2" aria-live="polite">
          <p className="text-caption font-bold">Aperçu pour les participants</p>
          <EventView
            title={watched.title ?? ''}
            kind={watched.kind ?? 'community'}
            cover={watched.cover ?? ''}
            startsAt={new Date(watched.startsAt ?? '').getTime()}
            endsAt={new Date(watched.endsAt ?? '').getTime()}
            location={watched.location ?? ''}
            description={watched.description ?? ''}
          />
        </div>
      ) : null}

      <div className="grid gap-3">
        <Button type="button" size="lg" onClick={() => void submit(true)()}>
          Créer l’événement
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => void submit(false)()}
        >
          Enregistrer
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => setPreviewing((value) => !value)}
        >
          {previewing ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {previewing ? 'Masquer l’aperçu' : 'Prévisualiser'}
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
