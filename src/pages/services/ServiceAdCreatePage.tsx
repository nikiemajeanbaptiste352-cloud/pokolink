import { Check, CircleCheck, Info } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AdJourney } from '@/components/ads/AdJourney'
import { AdPackCard } from '@/components/ads/AdPackCard'
import { AdPreview } from '@/components/ads/AdPreview'
import { BackLink } from '@/components/common/BackLink'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useCurrentService } from '@/hooks/use-current-service'
import { useProfile } from '@/hooks/use-profile'
import { useServiceItems } from '@/hooks/use-services'
import { splitName } from '@/lib/payment-labels'
import {
  AD_CHANNEL_LABEL,
  AD_CHANNELS,
  AD_CTA_LABEL,
  AD_CTAS,
  AD_DAILY_LIMITS,
  AD_MISSION_LABEL,
  AD_PACKS,
  AD_TARGET_LABEL,
  DEFAULT_AD_CHANNELS,
  formatMissionPoints,
  getAdPack,
} from '@/lib/ad-packs'
import { addCampaign } from '@/lib/ad-campaigns-store'
import { formatNumber, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { AdChannel, AdCta, AdMissionType, AdPackId, AdTargetKind } from '@/types/ads'

type Step = 'pack' | 'type' | 'content' | 'payment' | 'done'

const STEPS: readonly { id: Exclude<Step, 'done'>; label: string }[] = [
  { id: 'pack', label: 'Forfait' },
  { id: 'type', label: 'Type' },
  { id: 'content', label: 'Annonce' },
  { id: 'payment', label: 'Paiement' },
]

const TARGETS = Object.keys(AD_TARGET_LABEL) as AdTargetKind[]
const MISSIONS = Object.keys(AD_MISSION_LABEL) as AdMissionType[]

const TITLE_MAX = 60
const TEXT_MAX = 140

function Stepper({ step }: { step: Step }) {
  const current = step === 'done' ? STEPS.length : STEPS.findIndex((s) => s.id === step)
  return (
    <ol aria-label="Étapes de création" className="flex gap-2 px-4">
      {STEPS.map((item, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={item.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                'h-1.5 w-full rounded-full',
                done || active ? 'bg-brand' : 'bg-muted',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'inline-flex w-full items-center justify-center gap-0.5 text-[11px] leading-4 font-bold',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-3 shrink-0 text-brand" aria-hidden="true" />
              ) : null}
              <span className="truncate">{item.label}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

/**
 * Créer une publicité depuis l'Espace Pro : forfait, type d'annonce, contenu, paiement avec le
 * Wallet FCFA. Le frontend n'envoie qu'une demande : la campagne reste « en attente de
 * paiement » jusqu'à la réponse du serveur, qui valide aussi l'annonce et décide de sa
 * diffusion. Aucune diffusion, aucun résultat ni aucun point ne sont simulés ici.
 */
export function ServiceAdCreatePage() {
  const service = useCurrentService()
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const items = useServiceItems(service.id)
  const [step, setStep] = useState<Step>('pack')
  const [packId, setPackId] = useState<AdPackId>('silver')
  const [channels, setChannels] = useState<AdChannel[]>([...DEFAULT_AD_CHANNELS])
  const [target, setTarget] = useState<AdTargetKind>('establishment')
  const [itemId, setItemId] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [cta, setCta] = useState<AdCta>('discover')
  const [image, setImage] = useState('')
  const [errors, setErrors] = useState<{ title?: string; text?: string; item?: string }>(
    {},
  )
  const [campaignId, setCampaignId] = useState<string | null>(null)

  function toggleChannel(channel: AdChannel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    )
  }

  const pack = getAdPack(packId)
  const item = items.find((candidate) => candidate.id === itemId)
  const adsPath = paths.serviceAds(service.id)

  function go(next: Step) {
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  function validateContent(): boolean {
    const next: typeof errors = {}
    if (target === 'item' && !item) next.item = 'Choisissez l’élément à mettre en avant'
    if (title.trim().length < 3) next.title = 'Le titre contient au moins 3 caractères'
    if (text.trim().length < 10) next.text = 'Le texte contient au moins 10 caractères'
    setErrors(next)
    if (Object.keys(next).length === 0) return true
    // Remonter vers le premier champ en erreur (sinon le bouton semble « mort »).
    const focusId = next.item ? 'ad-item' : next.title ? 'ad-title' : 'ad-text'
    queueMicrotask(() => {
      const field = document.getElementById(focusId)
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field?.focus()
    })
    return false
  }

  function sent() {
    if (campaignId) return
    // Une seule campagne par parcours : le serveur gardera la clé d'idempotence.
    const created = addCampaign(
      {
        serviceId: service.id,
        pack: packId,
        target,
        title: title.trim(),
        text: text.trim(),
        cta,
        image,
        channels: channels.length > 0 ? channels : [...DEFAULT_AD_CHANNELS],
        ...(target === 'item' && item ? { itemId: item.id, itemName: item.name } : {}),
      },
      timestamp(),
    )
    setCampaignId(created.id)
    go('done')
  }

  return (
    <article className="space-y-5 pt-4 pb-28 md:pb-8">
      <div className="flex items-center gap-2 px-4">
        <BackLink to={adsPath} label="Publicité" history className="-ml-2" />
        <h2 className="min-w-0 truncate text-headline font-extrabold">
          Créer une publicité
        </h2>
      </div>
      <Stepper step={step} />

      {step === 'pack' ? (
        <section aria-label="Choix du forfait" className="space-y-4 px-4">
          <div>
            <h3 className="text-title font-extrabold">Choisissez un forfait</h3>
            <p className="text-body text-muted-foreground">
              Le forfait fixe votre budget et le nombre de vues, de visites et
              d’abonnements visés.
            </p>
          </div>
          <div role="radiogroup" aria-label="Forfait publicitaire" className="space-y-3">
            {AD_PACKS.map((candidate) => (
              <AdPackCard
                key={candidate.id}
                pack={candidate}
                selected={candidate.id === packId}
                onSelect={() => setPackId(candidate.id)}
              />
            ))}
          </div>

          <section
            aria-label="Canaux de diffusion"
            className="space-y-2 rounded-2xl border bg-card p-4 shadow-card"
          >
            <h4 className="text-body font-extrabold">Canaux de diffusion</h4>
            <p className="text-caption text-muted-foreground">
              Où l’annonce sponsorisée apparaît. Les missions Rewards y sont reliées.
            </p>
            <ul className="space-y-2">
              {AD_CHANNELS.map((channel) => {
                const selected = channels.includes(channel)
                const meta = AD_CHANNEL_LABEL[channel]
                return (
                  <li key={channel}>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-background px-3 py-2.5 has-checked:border-brand has-checked:bg-accent/40">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleChannel(channel)}
                        className="mt-1 size-4 accent-[var(--brand)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-body font-bold">{meta.label}</span>
                        <span className="block text-caption text-muted-foreground">
                          {meta.description}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {channels.length === 0 ? (
              <p role="alert" className="text-caption font-medium text-danger">
                Choisissez au moins un canal.
              </p>
            ) : null}
          </section>

          <section
            aria-label="Missions rémunérées"
            className="space-y-2 rounded-2xl bg-muted p-4"
          >
            <h4 className="text-body font-extrabold">
              Ce que gagnent les utilisateurs (forfait {pack.label})
            </h4>
            <ul className="space-y-1.5">
              {MISSIONS.map((mission) => (
                <li
                  key={mission}
                  className="flex items-baseline justify-between gap-3 text-body"
                >
                  <span className="min-w-0">
                    {AD_MISSION_LABEL[mission].label}
                    <span className="block text-caption text-muted-foreground">
                      {AD_MISSION_LABEL[mission].hint} · max {AD_DAILY_LIMITS[mission]}{' '}
                      par jour
                    </span>
                  </span>
                  <strong className="shrink-0 tabular-nums">
                    {formatMissionPoints(pack.rewardPerMission[mission])}
                  </strong>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              Budget Rewards de la campagne : {formatPrice(pack.rewardBudget)} (
              {formatNumber(pack.rewardPoints)} points nominaux). Les points ne sont
              attribués qu’après validation de la mission par le serveur.
            </p>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={channels.length === 0}
              onClick={() => go('type')}
            >
              Continuer
            </Button>
          </div>
        </section>
      ) : null}

      {step === 'type' ? (
        <section aria-label="Type de publicité" className="space-y-4 px-4">
          <div>
            <h3 className="text-title font-extrabold">Que voulez-vous promouvoir ?</h3>
            <p className="text-body text-muted-foreground">
              Le type d’annonce détermine la page où mène le bouton.
            </p>
          </div>
          <div role="radiogroup" aria-label="Type de publicité" className="space-y-3">
            {TARGETS.map((kind) => {
              const selected = kind === target
              return (
                <button
                  key={kind}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTarget(kind)}
                  className={cn(
                    'flex min-h-11 w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-card',
                    selected && 'border-brand ring-2 ring-brand/30',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2',
                      selected
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border',
                    )}
                  >
                    {selected ? <Check className="size-4" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body font-extrabold">
                      {AD_TARGET_LABEL[kind].label}
                    </span>
                    <span className="block text-caption text-muted-foreground">
                      {AD_TARGET_LABEL[kind].description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {target === 'item' ? (
            items.length === 0 ? (
              <p role="status" className="rounded-xl bg-warning/20 p-3.5 text-body">
                Votre catalogue est vide. Ajoutez d’abord un élément pour pouvoir le
                mettre en avant.{' '}
                <Link
                  to={paths.serviceItemNew(service.id)}
                  className="font-bold underline underline-offset-2"
                >
                  Ajouter un élément
                </Link>
              </p>
            ) : (
              <Field id="ad-item" label="Élément à mettre en avant" error={errors.item}>
                {(a11y) => (
                  <Select
                    {...a11y}
                    value={itemId}
                    onChange={(event) => {
                      setItemId(event.target.value)
                      setErrors((current) => ({ ...current, item: undefined }))
                    }}
                  >
                    <option value="">Choisir…</option>
                    {items.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} · {formatPrice(candidate.price)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )
          ) : null}

          <div className="sticky bottom-0 z-10 -mx-4 space-y-2 border-t bg-background/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={target === 'item' && items.length === 0}
              onClick={() => {
                if (target === 'item' && !item) {
                  setErrors({ item: 'Choisissez l’élément à mettre en avant' })
                  return
                }
                setErrors({})
                go('content')
              }}
            >
              Continuer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => go('pack')}
            >
              Retour au forfait
            </Button>
          </div>
        </section>
      ) : null}

      {step === 'content' ? (
        <section aria-label="Contenu de l’annonce" className="space-y-5 px-4">
          <div>
            <h3 className="text-title font-extrabold">Rédigez votre annonce</h3>
            <p className="text-body text-muted-foreground">
              {target === 'item' && item
                ? `Mise en avant : ${item.name}.`
                : AD_TARGET_LABEL[target].label + '.'}
            </p>
          </div>

          <Field id="ad-title" label="Titre" error={errors.title}>
            {(a11y) => (
              <Input
                {...a11y}
                value={title}
                maxLength={TITLE_MAX}
                placeholder={
                  target === 'promotion'
                    ? 'Ex. -10 % ce week-end'
                    : 'Ex. Découvrez nos nouveautés'
                }
                onChange={(event) => {
                  setTitle(event.target.value)
                  setErrors((current) => ({ ...current, title: undefined }))
                }}
              />
            )}
          </Field>

          <Field
            id="ad-text"
            label="Texte"
            error={errors.text}
            hint={`${text.length} / ${TEXT_MAX} caractères`}
          >
            {(a11y) => (
              <Textarea
                {...a11y}
                value={text}
                maxLength={TEXT_MAX}
                onChange={(event) => {
                  setText(event.target.value)
                  setErrors((current) => ({ ...current, text: undefined }))
                }}
              />
            )}
          </Field>

          <Field id="ad-cta" label="Bouton de l’annonce">
            {(a11y) => (
              <Select
                {...a11y}
                value={cta}
                onChange={(event) => setCta(event.target.value as AdCta)}
              >
                {AD_CTAS.map((id) => (
                  <option key={id} value={id}>
                    {AD_CTA_LABEL[id]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <ImageField
            label="Image de l’annonce"
            value={image}
            onChange={setImage}
            icon={Info}
            tone="violet"
            shape="wide"
            maxSize={900}
            hint="Format paysage conseillé. Elle sera vérifiée avant diffusion."
          />

          <div className="space-y-2">
            <h4 className="text-body font-extrabold">Aperçu</h4>
            <AdPreview
              serviceName={service.name}
              logo={service.logo}
              title={title}
              text={text}
              cta={cta}
              image={image || (target === 'item' ? (item?.image ?? '') : '')}
            />
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 space-y-2 border-t bg-background/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            {(errors.title || errors.text) && (
              <p role="alert" className="text-center text-caption font-medium text-danger">
                Complétez le titre (3 car. min.) et le texte (10 car. min.) pour continuer.
              </p>
            )}
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => {
                if (validateContent()) go('payment')
              }}
            >
              Continuer vers le paiement
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => go('type')}
            >
              Retour au type
            </Button>
          </div>
        </section>
      ) : null}

      {step === 'payment' ? (
        <section aria-label="Paiement de la campagne" className="space-y-4 px-4">
          <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Annonce</dt>
              <dd className="min-w-0 text-right text-body font-extrabold break-words">
                {title.trim()}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Type</dt>
              <dd className="text-right text-body font-bold">
                {AD_TARGET_LABEL[target].label}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Forfait</dt>
              <dd className="text-right text-body font-bold">{pack.label}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Canaux</dt>
              <dd className="text-right text-body font-bold">
                {channels.map((c) => AD_CHANNEL_LABEL[c].label).join(' · ')}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-body text-muted-foreground">Montant</dt>
              <dd className="text-title font-extrabold tabular-nums">
                {formatPrice(pack.price)}
              </dd>
            </div>
          </dl>
          <p className="text-caption text-muted-foreground">
            50 % du forfait finance le budget Rewards de la campagne, 50 % revient à
            AfriConnect.
          </p>

          <WalletPaymentForm
            purpose="advertising"
            title={`Publicité ${pack.label} · ${service.name}`}
            detail={title.trim()}
            amount={pack.price}
            fees={0}
            payer={{ firstName, lastName }}
            beneficiary={{
              name: service.name,
              handle: service.username,
              business: service.name,
              serviceId: service.id,
            }}
            waitingLabel="Confirmer"
            actionLabel="Confirmer le paiement"
            onSent={sent}
          />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => go('content')}
          >
            Retour à l’annonce
          </Button>
        </section>
      ) : null}

      {step === 'done' ? (
        <section aria-label="Campagne diffusée" className="space-y-4 px-4">
          <div className="space-y-2 rounded-2xl bg-success/15 p-4" role="status">
            <p className="flex items-center gap-2 text-title font-extrabold">
              <CircleCheck className="size-6 shrink-0 text-success" aria-hidden="true" />
              Campagne en diffusion
            </p>
            <p className="text-body">
              L’annonce est marquée Sponsorisé sur{' '}
              {channels.map((c) => AD_CHANNEL_LABEL[c].label).join(', ')}. Les missions
              Rewards sont reliées à ces canaux.
            </p>
          </div>
          <AdJourney status="active" />
          <div className="grid gap-2">
            {campaignId ? (
              <Link
                to={paths.serviceAd(service.id, campaignId)}
                className={buttonVariants({ size: 'lg' })}
              >
                Suivre la campagne
              </Link>
            ) : null}
            <Link
              to={adsPath}
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
            >
              Retour à Publicité
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  )
}
