import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Film, ImageIcon, Trash2, Upload } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { PartnershipLinkField } from '@/components/form/PartnershipLinkField'
import { EventPreview } from '@/components/studio/EventPreview'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatNumber, formatPrice } from '@/lib/format'
import { toLocalInput } from '@/lib/pro-labels'
import {
  STUDIO_DURATIONS,
  STUDIO_KINDS,
  STUDIO_LIMITS,
  formatFileSize,
  getMaxCollection,
  parseHashtags,
} from '@/lib/studio'
import { buildStudioSchema, toInteger, type StudioFormValues } from '@/lib/studio-schemas'
import { normalizePartnershipLink } from '@/lib/partnership-link'
import {
  saveStudioDraft,
  submitStudioEvent,
  type StudioDraftInput,
} from '@/lib/studio-store'
import { cn } from '@/lib/utils'
import type { StudioEvent, StudioEventKind } from '@/types/studio'

const HOUR = 60 * 60 * 1000
const MB = 1024 * 1024

export type StudioFormOutcome = 'draft' | 'submitted'

interface StudioEventFormProps {
  /** Événement à modifier ; absent pour une création. */
  event?: StudioEvent
  /** Type présélectionné pour une création. */
  initialKind?: StudioEventKind
  onFinished: (event: StudioEvent, outcome: StudioFormOutcome) => void
  onCancel: () => void
}

function toInput(values: StudioFormValues): StudioDraftInput {
  const link = normalizePartnershipLink(values.partnershipLink)
  const input: StudioDraftInput = {
    kind: values.kind,
    caption: values.caption.trim(),
    hashtags: parseHashtags(values.hashtags),
    videoName: values.videoName,
    videoSize: values.videoSize,
    cover: values.cover,
    startsAt: new Date(values.startsAt).getTime(),
    durationHours: Number(values.duration),
    ...(link ? { partnershipLink: link } : { partnershipLink: undefined }),
  }
  if (values.kind === 'coins') {
    const coins = toInteger(values.maxCoins)
    const price = toInteger(values.coinPrice)
    if (coins !== null) input.maxCoins = coins
    if (price !== null) input.coinPrice = price
  }
  return input
}

function getDefaults(
  event: StudioEvent | undefined,
  initialKind: StudioEventKind,
  now: number,
): StudioFormValues {
  const tomorrow = Math.ceil((now + 24 * HOUR) / HOUR) * HOUR
  return {
    kind: event?.kind ?? initialKind,
    caption: event?.caption ?? '',
    hashtags: event ? event.hashtags.map((tag) => `#${tag}`).join(' ') : '',
    cover: event?.cover ?? '',
    videoName: event?.videoName ?? '',
    videoSize: event?.videoSize ?? 0,
    startsAt: toLocalInput(event?.startsAt ?? tomorrow),
    duration: String(event?.durationHours ?? 24),
    maxCoins: event?.maxCoins ? String(event.maxCoins) : '',
    coinPrice: event?.coinPrice ? String(event.coinPrice) : '',
    partnershipLink: event?.partnershipLink ?? '',
    rights: false,
    noSelfTrade: false,
    serverRules: false,
  }
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-title font-extrabold">{title}</h2>
        {description ? (
          <p className="text-body text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function CheckRow({
  id,
  error,
  children,
  inputProps,
}: {
  id: string
  error: string | undefined
  children: ReactNode
  inputProps: ComponentProps<'input'>
}) {
  const errorId = `${id}-error`
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-muted p-3.5 text-body"
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 accent-primary"
          {...inputProps}
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Formulaire de création ou de modification d'un événement Creator Market (cote ou coins).
 * « Enregistrer le brouillon » accepte un formulaire incomplet ; « Envoyer pour validation »
 * exige tout et ne publie rien : l'événement passe « En revue » et AfriConnect décide.
 */
export function StudioEventForm({
  event,
  initialKind = 'factor',
  onFinished,
  onCancel,
}: StudioEventFormProps) {
  const [now] = useState(() => Date.now())
  const [previewing, setPreviewing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  const submitSchema = useMemo(() => buildStudioSchema(now, 'submit'), [now])
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useForm<StudioFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: getDefaults(event, initialKind, now),
  })
  const watched = useWatch({ control })
  const kind = watched.kind ?? 'factor'

  // L'aperçu local de la vidéo est libéré quand on la remplace ou quand on quitte l'écran.
  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    },
    [videoUrl],
  )

  function chooseVideo(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setError('videoName', { message: 'Ce fichier n’est pas une vidéo' })
      return
    }
    setVideoUrl(URL.createObjectURL(file))
    setValue('videoName', file.name, { shouldValidate: false })
    setValue('videoSize', file.size, { shouldValidate: false })
    if (file.size > STUDIO_LIMITS.videoMaxMb * MB) {
      setError('videoName', {
        message: `La vidéo ne peut pas dépasser ${STUDIO_LIMITS.videoMaxMb} Mo`,
      })
    } else {
      clearErrors('videoName')
    }
  }

  function removeVideo() {
    setVideoUrl(null)
    setValue('videoName', '')
    setValue('videoSize', 0)
    clearErrors('videoName')
  }

  function saveDraft() {
    const values = getValues()
    clearErrors()
    const result = buildStudioSchema(now, 'draft').safeParse(values)
    if (!result.success) {
      let first: keyof StudioFormValues | undefined
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field !== 'string') continue
        first ??= field as keyof StudioFormValues
        setError(field as keyof StudioFormValues, { message: issue.message })
      }
      if (first) setFocus(first)
      return
    }
    const saved = saveStudioDraft(event?.id, toInput(values), Date.now())
    if (saved) onFinished(saved, 'draft')
  }

  function submitForm() {
    void handleSubmit((values) => {
      const saved = saveStudioDraft(event?.id, toInput(values), Date.now())
      if (!saved) return
      const submitted = submitStudioEvent(saved.id, Date.now())
      onFinished(submitted ?? saved, 'submitted')
    })()
  }

  const coins = toInteger(watched.maxCoins ?? '')
  const price = toInteger(watched.coinPrice ?? '')
  const maxCollection =
    kind === 'coins' && coins !== null && price !== null
      ? getMaxCollection({ maxCoins: coins, coinPrice: price })
      : null

  const startsAtMs = watched.startsAt ? new Date(watched.startsAt).getTime() : NaN
  const videoName = watched.videoName ?? ''
  const videoSize = watched.videoSize ?? 0

  return (
    <form
      onSubmit={(formEvent) => {
        formEvent.preventDefault()
        submitForm()
      }}
      noValidate
      className="space-y-8 px-4 pt-4 pb-8"
    >
      {/* 1. Type */}
      <Section
        title="1. Type d’événement"
        description="Chaque type a ses propres règles. Le calcul reste entièrement fait par AfriConnect."
      >
        <fieldset>
          <legend className="sr-only">Type d’événement</legend>
          <div className="grid gap-3">
            {(Object.keys(STUDIO_KINDS) as StudioEventKind[]).map((id) => {
              const meta = STUDIO_KINDS[id]
              const Icon = meta.icon
              return (
                <label key={id} className="relative flex">
                  <input
                    type="radio"
                    value={id}
                    className="peer sr-only"
                    {...register('kind')}
                  />
                  <span
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-3.5 transition-colors hover:bg-muted',
                      'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
                      kind === id ? 'border-primary bg-accent' : 'border-border',
                    )}
                  >
                    <Icon
                      className="mt-0.5 size-6 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-body font-bold">{meta.label}</span>
                      <span className="block text-caption text-muted-foreground">
                        {meta.description}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </Section>

      {/* 2. Contenu */}
      <Section
        title="2. Vidéo et légende"
        description="La vidéo est celle dont les vues validées font vivre l’événement."
      >
        <div className="space-y-1.5">
          <span id="studio-video-label" className="block text-body font-semibold">
            Vidéo
          </span>
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label="Aperçu de la vidéo choisie"
              className="aspect-video w-full rounded-xl bg-black"
            />
          ) : null}
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Film className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-body" id="studio-video-name">
              {videoName ? (
                <>
                  <span className="block truncate font-semibold">{videoName}</span>
                  <span className="block text-caption text-muted-foreground">
                    {formatFileSize(videoSize)}
                    {videoUrl ? '' : ' · déjà ajoutée'}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Aucune vidéo choisie</span>
              )}
            </p>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="outline"
                onClick={() => videoInput.current?.click()}
                aria-describedby="studio-video-name"
              >
                <Upload aria-hidden="true" />
                {videoName ? 'Changer' : 'Choisir'}
              </Button>
              {videoName ? (
                <Button variant="ghost" size="icon" onClick={removeVideo}>
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">Retirer la vidéo</span>
                </Button>
              ) : null}
            </div>
          </div>
          <input
            ref={videoInput}
            type="file"
            accept="video/*"
            aria-labelledby="studio-video-label"
            className="sr-only"
            tabIndex={-1}
            onChange={(changeEvent) => {
              chooseVideo(changeEvent.target.files?.[0])
              changeEvent.target.value = ''
            }}
          />
          <p className="text-caption text-muted-foreground">
            {STUDIO_LIMITS.videoMaxMb} Mo au maximum.
          </p>
          {errors.videoName ? (
            <p role="alert" className="text-caption font-medium text-danger">
              {errors.videoName.message}
            </p>
          ) : null}
        </div>

        <Controller
          control={control}
          name="cover"
          render={({ field }) => (
            <ImageField
              label="Image de couverture"
              value={field.value}
              onChange={field.onChange}
              icon={ImageIcon}
              tone="violet"
              maxSize={640}
              shape="wide"
              hint="Affichée avant le lancement de la vidéo."
            />
          )}
        />

        <Field
          id="studio-caption"
          label="Légende"
          error={errors.caption?.message}
          hint={`${(watched.caption ?? '').trim().length} / ${STUDIO_LIMITS.captionMax} caractères`}
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              {...register('caption')}
              maxLength={STUDIO_LIMITS.captionMax + 20}
              placeholder="Ex. Ma recette du jour : le poulet yassa comme à la maison."
            />
          )}
        </Field>

        <Field
          id="studio-hashtags"
          label="Mots-clés"
          optional
          error={errors.hashtags?.message}
          hint={`${STUDIO_LIMITS.hashtagsMax} au maximum, séparés par un espace ou une virgule.`}
        >
          {(a11y) => (
            <Input
              {...a11y}
              {...register('hashtags')}
              autoCapitalize="none"
              placeholder="#Cuisine #Dakar"
            />
          )}
        </Field>

        <PartnershipLinkField
          id="studio-partnership"
          inputProps={register('partnershipLink')}
        />
      </Section>

      {/* 3. Calendrier */}
      <Section
        title="3. Calendrier"
        description={
          kind === 'coins'
            ? 'Les achats de coins ferment au début de l’événement.'
            : 'Le facteur démarre à 1,000 et reste neutre pendant les premières périodes.'
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="studio-start"
            label="Début"
            error={errors.startsAt?.message}
            hint={`Au moins ${STUDIO_LIMITS.leadHours} heures après l’envoi, pour la validation.`}
          >
            {(a11y) => (
              <Input {...a11y} {...register('startsAt')} type="datetime-local" />
            )}
          </Field>
          <Field id="studio-duration" label="Durée" error={errors.duration?.message}>
            {(a11y) => (
              <Select {...a11y} {...register('duration')}>
                {STUDIO_DURATIONS.map((item) => (
                  <option key={item.hours} value={item.hours}>
                    {item.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Section>

      {/* 4. Coins */}
      {kind === 'coins' ? (
        <Section
          title="4. Coins"
          description="Nombre limité de coins, vendus au même prix avant le début."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="studio-coins"
              label="Nombre de coins"
              error={errors.maxCoins?.message}
              hint={`Entre ${STUDIO_LIMITS.coinsMin} et ${formatNumber(STUDIO_LIMITS.coinsMax)}.`}
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('maxCoins')}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1000"
                />
              )}
            </Field>
            <Field
              id="studio-price"
              label="Prix initial d’un coin (FCFA)"
              error={errors.coinPrice?.message}
              hint={`Entre ${STUDIO_LIMITS.priceMin} et ${formatNumber(STUDIO_LIMITS.priceMax)}.`}
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('coinPrice')}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="500"
                />
              )}
            </Field>
          </div>
          {maxCollection !== null ? (
            <p className="rounded-xl bg-muted p-3.5 text-body" aria-live="polite">
              Si tous les coins sont achetés, les achats représentent{' '}
              <strong>{formatPrice(maxCollection)}</strong>. C’est un ordre de grandeur :
              la collecte réelle et ce qui vous revient sont fixés par AfriConnect.
            </p>
          ) : null}
          <p className="text-caption text-muted-foreground">
            Le plafond d’achat par personne et les frais ne sont pas réglables ici :
            AfriConnect les fixe.
          </p>
        </Section>
      ) : null}

      {/* Aperçu */}
      <section className="space-y-3" aria-label="Aperçu">
        <Button
          variant="outline"
          className="w-full"
          aria-expanded={previewing}
          onClick={() => setPreviewing((value) => !value)}
        >
          {previewing ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {previewing ? 'Masquer l’aperçu' : 'Prévisualiser pour les participants'}
        </Button>
        {previewing ? (
          <EventPreview
            data={{
              kind,
              caption: watched.caption ?? '',
              hashtags: parseHashtags(watched.hashtags ?? ''),
              cover: watched.cover ?? '',
              startsAt: Number.isNaN(startsAtMs) ? null : startsAtMs,
              durationHours: Number(watched.duration ?? 24),
              ...(coins !== null ? { maxCoins: coins } : {}),
              ...(price !== null ? { coinPrice: price } : {}),
            }}
          />
        ) : null}
      </section>

      {/* Engagements */}
      <Section
        title={kind === 'coins' ? '5. Engagements' : '4. Engagements'}
        description="Obligatoires pour envoyer l’événement. Inutiles pour un simple brouillon."
      >
        <div className="space-y-3">
          <CheckRow
            id="studio-rights"
            error={errors.rights?.message}
            inputProps={register('rights')}
          >
            Je suis l’auteur de cette vidéo, ou j’ai tous les droits pour l’utiliser
            (image, musique, personnes filmées).
          </CheckRow>
          <CheckRow
            id="studio-self"
            error={errors.noSelfTrade?.message}
            inputProps={register('noSelfTrade')}
          >
            Je ne participerai pas à mon événement et je ne ferai rien pour gonfler
            artificiellement les vues.
          </CheckRow>
          <CheckRow
            id="studio-rules"
            error={errors.serverRules?.message}
            inputProps={register('serverRules')}
          >
            Je comprends qu’AfriConnect valide ou refuse l’événement et calcule seul le
            facteur ou l’indice, le pool et tous les montants.
          </CheckRow>
        </div>
      </Section>

      <div className="grid gap-3">
        <Button type="submit" size="lg">
          Envoyer pour validation
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={saveDraft}>
          Enregistrer le brouillon
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
