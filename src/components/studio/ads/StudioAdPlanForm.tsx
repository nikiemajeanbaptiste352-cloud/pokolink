import { ImageIcon, Info } from 'lucide-react'
import { useState } from 'react'

import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { formatPrice } from '@/lib/format'
import {
  STUDIO_AD_PLATFORMS,
  STUDIO_AD_PLATFORM_FEE_RATE,
  STUDIO_AD_PLATFORM_LABEL,
  studioAdCreatorNet,
  studioAdPlatformFee,
} from '@/lib/studio-ads-labels'
import { saveStudioAdPlan } from '@/lib/studio-ads-store'
import { cn } from '@/lib/utils'
import type {
  StudioAdPlan,
  StudioAdPlatform,
  StudioAdSocialStat,
} from '@/types/studio-ads'

type SocialDraft = {
  handle: string
  followers: string
  engagementPct: string
  avgViews: string
}

function emptyDraft(): SocialDraft {
  return { handle: '', followers: '', engagementPct: '', avgViews: '' }
}

function draftsFromPlan(
  plan: StudioAdPlan | undefined,
  platforms: readonly StudioAdPlatform[],
): Record<string, SocialDraft> {
  const next: Record<string, SocialDraft> = {}
  for (const id of platforms) {
    const row = plan?.socialStats?.find((s) => s.platform === id)
    next[id] = row
      ? {
          handle: row.handle,
          followers: String(row.followers),
          engagementPct: (row.engagementRate * 100).toFixed(1).replace(/\.0$/, ''),
          avgViews: String(row.avgViews),
        }
      : emptyDraft()
  }
  return next
}

export function StudioAdPlanForm({
  plan,
  onDone,
}: {
  plan?: StudioAdPlan
  onDone: () => void
}) {
  const [name, setName] = useState(plan?.name ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [imageSrc, setImageSrc] = useState(plan?.imageSrc ?? '')
  const [platforms, setPlatforms] = useState<StudioAdPlatform[]>(
    plan ? [...plan.platforms] : ['instagram'],
  )
  const [socialDrafts, setSocialDrafts] = useState<Record<string, SocialDraft>>(
    () => draftsFromPlan(plan, plan?.platforms ?? ['instagram']),
  )
  const [inclusionsText, setInclusionsText] = useState(
    plan?.inclusions.join('\n') ?? '',
  )
  const [price, setPrice] = useState(
    plan?.price != null ? String(plan.price) : '',
  )
  const [turnaround, setTurnaround] = useState(plan?.turnaround ?? '')
  const [conditions, setConditions] = useState(plan?.conditions ?? '')
  const [error, setError] = useState('')

  const feePct = Math.round(STUDIO_AD_PLATFORM_FEE_RATE * 100)
  const priceNum = Number(price)
  const hasPrice = priceNum > 0
  const commission = hasPrice ? studioAdPlatformFee(priceNum) : 0
  const creatorNet = hasPrice ? studioAdCreatorNet(priceNum) : 0

  function togglePlatform(id: StudioAdPlatform) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
    setSocialDrafts((prev) =>
      prev[id] ? prev : { ...prev, [id]: emptyDraft() },
    )
  }

  function patchSocial(id: StudioAdPlatform, patch: Partial<SocialDraft>) {
    setSocialDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyDraft()), ...patch },
    }))
  }

  function buildSocialStats(): StudioAdSocialStat[] | null {
    const rows: StudioAdSocialStat[] = []
    for (const id of platforms) {
      const draft = socialDrafts[id] ?? emptyDraft()
      const followers = Number(draft.followers)
      const engagementPct = Number(draft.engagementPct.replace(',', '.'))
      const avgViews = Number(draft.avgViews)
      if (!draft.handle.trim()) {
        setError(`Indiquez le compte ${STUDIO_AD_PLATFORM_LABEL[id]}.`)
        return null
      }
      if (!(followers >= 0) || Number.isNaN(followers)) {
        setError(`Abonnés invalides pour ${STUDIO_AD_PLATFORM_LABEL[id]}.`)
        return null
      }
      if (
        Number.isNaN(engagementPct) ||
        engagementPct < 0 ||
        engagementPct > 100
      ) {
        setError(
          `Engagement invalide pour ${STUDIO_AD_PLATFORM_LABEL[id]} (0 à 100 %).`,
        )
        return null
      }
      if (!(avgViews >= 0) || Number.isNaN(avgViews)) {
        setError(`Vues moyennes invalides pour ${STUDIO_AD_PLATFORM_LABEL[id]}.`)
        return null
      }
      rows.push({
        platform: id,
        handle: draft.handle.trim(),
        followers,
        engagementRate: engagementPct / 100,
        avgViews,
      })
    }
    return rows
  }

  function buildInput(status: StudioAdPlan['status']) {
    const inclusions = inclusionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!name.trim()) return setError('Indiquez un nom de forfait.'), null
    if (!description.trim()) return setError('Ajoutez une description.'), null
    if (platforms.length === 0)
      return setError('Choisissez au moins une plateforme.'), null
    if (inclusions.length === 0)
      return setError('Ajoutez au moins une prestation incluse.'), null
    if (!(Number(price) > 0))
      return setError('Indiquez le prix total du forfait en FCFA.'), null
    const socialStats = buildSocialStats()
    if (!socialStats) return null
    setError('')
    return {
      name,
      description,
      ...(imageSrc ? { imageSrc } : {}),
      platforms,
      socialStats,
      inclusions,
      price: Number(price),
      turnaround: turnaround.trim() || 'À préciser',
      conditions: conditions.trim() || '—',
      status,
    }
  }

  function save(status: StudioAdPlan['status']) {
    const input = buildInput(status)
    if (!input) return
    saveStudioAdPlan(input, plan?.id)
    onDone()
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        save(plan?.status === 'published' ? 'published' : 'draft')
      }}
    >
      <Field id="sap-name" label="Nom du forfait">
        {(a11y) => (
          <Input
            {...a11y}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Story Instagram · 24 h"
          />
        )}
      </Field>
      <Field id="sap-desc" label="Description">
        {(a11y) => (
          <Textarea
            {...a11y}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ce que l’annonceur obtient…"
          />
        )}
      </Field>
      <ImageField
        label="Image de présentation"
        value={imageSrc}
        onChange={setImageSrc}
        icon={ImageIcon}
        shape="wide"
        hint="Optionnel · format paysage recommandé"
      />

      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold text-muted-foreground">
          Plateformes
        </legend>
        <div className="flex flex-wrap gap-2">
          {STUDIO_AD_PLATFORMS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={platforms.includes(id)}
              onClick={() => togglePlatform(id)}
              className={cn(
                'inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-bold',
                platforms.includes(id)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-muted',
              )}
            >
              {STUDIO_AD_PLATFORM_LABEL[id]}
            </button>
          ))}
        </div>
      </fieldset>

      {platforms.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-[12px] font-semibold text-muted-foreground">
            Statistiques des réseaux sociaux
          </legend>
          <p className="text-caption text-muted-foreground">
            Affichées sur la fiche publique du forfait pour rassurer les
            annonceurs.
          </p>
          {platforms.map((id) => {
            const draft = socialDrafts[id] ?? emptyDraft()
            return (
              <div
                key={id}
                className="space-y-2 rounded-2xl border bg-card p-3 shadow-card"
              >
                <p className="text-body font-extrabold">
                  {STUDIO_AD_PLATFORM_LABEL[id]}
                </p>
                <Field id={`sap-social-${id}-handle`} label="Compte / identifiant">
                  {(a11y) => (
                    <Input
                      {...a11y}
                      value={draft.handle}
                      onChange={(e) =>
                        patchSocial(id, { handle: e.target.value })
                      }
                      placeholder={
                        id === 'whatsapp' || id === 'facebook'
                          ? 'Nom du compte'
                          : '@votre.compte'
                      }
                    />
                  )}
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field id={`sap-social-${id}-followers`} label="Abonnés">
                    {(a11y) => (
                      <Input
                        {...a11y}
                        inputMode="numeric"
                        value={draft.followers}
                        onChange={(e) =>
                          patchSocial(id, {
                            followers: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="12000"
                      />
                    )}
                  </Field>
                  <Field id={`sap-social-${id}-eng`} label="Engagement %">
                    {(a11y) => (
                      <Input
                        {...a11y}
                        inputMode="decimal"
                        value={draft.engagementPct}
                        onChange={(e) =>
                          patchSocial(id, {
                            engagementPct: e.target.value.replace(/[^\d.,]/g, ''),
                          })
                        }
                        placeholder="4,5"
                      />
                    )}
                  </Field>
                  <Field id={`sap-social-${id}-views`} label="Vues moy.">
                    {(a11y) => (
                      <Input
                        {...a11y}
                        inputMode="numeric"
                        value={draft.avgViews}
                        onChange={(e) =>
                          patchSocial(id, {
                            avgViews: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="5000"
                      />
                    )}
                  </Field>
                </div>
              </div>
            )
          })}
        </fieldset>
      ) : null}

      <Field id="sap-incl" label="Prestations incluses (une par ligne)">
        {(a11y) => (
          <Textarea
            {...a11y}
            value={inclusionsText}
            onChange={(e) => setInclusionsText(e.target.value)}
            rows={4}
            placeholder={'1 story 15 s\nMention @marque\nLien en bio 24 h'}
          />
        )}
      </Field>

      <Field
        id="sap-price"
        label="Prix total (FCFA)"
        hint="Montant payé par l’acheteur. La commission plateforme est déduite de votre crédit."
      >
        {(a11y) => (
          <Input
            {...a11y}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            placeholder="25000"
          />
        )}
      </Field>

      {hasPrice ? (
        <div className="space-y-2 rounded-2xl border bg-muted/50 px-3.5 py-3">
          <p className="flex items-start gap-2 text-caption text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Répartition à chaque commande
          </p>
          <dl className="space-y-1.5 text-body">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Acheteur paie</dt>
              <dd className="font-extrabold tabular-nums">
                {formatPrice(priceNum)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">
                Commission plateforme ({feePct} %)
              </dt>
              <dd className="font-semibold tabular-nums">
                − {formatPrice(commission)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t pt-1.5">
              <dt className="font-semibold">Vous êtes crédité</dt>
              <dd className="font-extrabold text-brand tabular-nums">
                {formatPrice(creatorNet)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      <Field id="sap-delay" label="Délais" optional>
        {(a11y) => (
          <Input
            {...a11y}
            value={turnaround}
            onChange={(e) => setTurnaround(e.target.value)}
            placeholder="Ex. 5–7 jours"
          />
        )}
      </Field>
      <Field id="sap-cond" label="Conditions" optional>
        {(a11y) => (
          <Textarea
            {...a11y}
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            rows={2}
          />
        )}
      </Field>

      {error ? (
        <p role="alert" className="text-caption font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" onClick={() => save('draft')}>
          Enregistrer en brouillon
        </Button>
        <Button type="button" onClick={() => save('published')}>
          Publier
        </Button>
      </div>
    </form>
  )
}
