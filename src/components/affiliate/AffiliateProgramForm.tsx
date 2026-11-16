import { Handshake, Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import {
  AFFILIATE_AUDIENCE_LABEL,
  AFFILIATE_RATE_MAX,
  AFFILIATE_TARGET_LABEL,
  AFRICONNECT_AFFILIATE_PLATFORM_RATE,
  formatRatePct,
  isAffiliateRateValid,
  simulateSplit,
  vendorShareRate,
} from '@/lib/affiliate-labels'
import { saveAffiliateProgram } from '@/lib/affiliate-store'
import { useServiceItems } from '@/hooks/use-services'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type {
  AffiliateAudience,
  AffiliateProgram,
  AffiliateProgramStatus,
  AffiliateTargetKind,
} from '@/types/affiliate'

/** Instantané au chargement du module — évite Date.now() pendant le rendu. */
const BOOT_MS = Date.now()

const AUDIENCES = Object.keys(AFFILIATE_AUDIENCE_LABEL) as AffiliateAudience[]

function toDateInput(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fromDateInput(value: string): number {
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : Date.now()
}

/**
 * Formulaire Espace Pro — création / édition d’un programme d’affiliation.
 */
export function AffiliateProgramForm({
  serviceId,
  program,
}: {
  serviceId: string
  program?: AffiliateProgram
}) {
  const navigate = useNavigate()
  const catalog = useServiceItems(serviceId)
  const [name, setName] = useState(program?.name ?? '')
  const [imageSrc, setImageSrc] = useState(program?.imageSrc ?? '')
  const [description, setDescription] = useState(program?.description ?? '')
  const [collaboration, setCollaboration] = useState(
    program?.collaboration ?? '',
  )
  const [objective, setObjective] = useState(program?.objective ?? '')
  const [targetKind, setTargetKind] = useState<AffiliateTargetKind>(
    program?.targetKind === 'product' && program.productId
      ? 'product'
      : 'service',
  )
  const [productId, setProductId] = useState(program?.productId ?? '')
  const [affiliatePct, setAffiliatePct] = useState(
    program
      ? String(Math.round(program.affiliateRate * 1000) / 10)
      : '10',
  )
  const [commissionBase, setCommissionBase] = useState(
    program?.commissionBase ??
      'Montant commercial encaissé, après réductions, hors frais exclus.',
  )
  const [excludedFees, setExcludedFees] = useState(
    program?.excludedFees ?? 'Livraison et taxes séparées.',
  )
  const [audience, setAudience] = useState<AffiliateAudience>(
    program?.audience ?? 'both',
  )
  const [specialConditions, setSpecialConditions] = useState(
    program?.specialConditions ?? '',
  )
  const [promotionRules, setPromotionRules] = useState(
    program?.promotionRules ??
      'Promotion honnête. Attribution 30 jours, dernier clic valide.',
  )
  const [fraudRules, setFraudRules] = useState(
    program?.fraudRules ??
      'Auto-achats et fraudes interdits. Suspension possible sans perte des commissions déjà acquises.',
  )
  const [startsAt, setStartsAt] = useState(() =>
    toDateInput(program?.startsAt ?? BOOT_MS),
  )
  const [endsAt, setEndsAt] = useState(
    program?.endsAt ? toDateInput(program.endsAt) : '',
  )
  const [showParticipantCount, setShowParticipantCount] = useState(
    program?.showParticipantCount ?? true,
  )
  const [error, setError] = useState('')

  const platformRate = AFRICONNECT_AFFILIATE_PLATFORM_RATE
  const affiliateRate = Number(affiliatePct.replace(',', '.')) / 100
  const rateOk = isAffiliateRateValid(affiliateRate)
  const sim = simulateSplit(10_000, rateOk ? affiliateRate : 0, platformRate)
  const vendorPct = formatRatePct(
    vendorShareRate(rateOk ? affiliateRate : 0, platformRate),
  )

  function save(status: AffiliateProgramStatus) {
    if (!name.trim()) return setError('Indiquez le nom du programme.')
    if (!description.trim()) return setError('Ajoutez une description.')
    if (!collaboration.trim())
      return setError('Décrivez la collaboration proposée.')
    if (!objective.trim()) return setError('Indiquez l’objectif du programme.')
    if (targetKind === 'product' && !productId) {
      return setError('Choisissez le produit ciblé par le lien d’affiliation.')
    }
    if (!rateOk) {
      return setError(
        `Taux affilié invalide (0–${formatRatePct(AFFILIATE_RATE_MAX)}). La somme avec AfriConnect (${formatRatePct(platformRate)}) ne peut pas dépasser 100 %.`,
      )
    }
    setError('')
    try {
      const saved = saveAffiliateProgram(
        {
          serviceId,
          name,
          description,
          collaboration,
          objective,
          ...(imageSrc ? { imageSrc } : {}),
          targetKind,
          ...(targetKind === 'product' ? { productId } : {}),
          affiliateRate,
          commissionBase,
          excludedFees,
          audience,
          specialConditions,
          promotionRules,
          fraudRules,
          startsAt: fromDateInput(startsAt),
          ...(endsAt ? { endsAt: fromDateInput(endsAt) } : {}),
          showParticipantCount,
          status,
        },
        program?.id,
      )
      navigate(paths.serviceAffiliate(serviceId), { replace: true })
      return saved
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.')
    }
  }

  return (
    <form
      className="space-y-5 px-4 pb-8"
      onSubmit={(e) => {
        e.preventDefault()
        save(program?.status === 'published' ? 'published' : 'draft')
      }}
    >
      <section className="space-y-3" aria-labelledby="af-general">
        <h3 id="af-general" className="text-title font-extrabold">
          Informations générales
        </h3>
        <Field id="af-name" label="Nom du programme">
          {(a11y) => (
            <Input
              {...a11y}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Ambassadeurs boutique"
            />
          )}
        </Field>
        <ImageField
          label="Logo ou image (facultatif)"
          value={imageSrc}
          onChange={setImageSrc}
          icon={Handshake}
          shape="wide"
          hint="Optionnel · format paysage"
        />
        <Field id="af-desc" label="Description">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          )}
        </Field>
        <Field id="af-collab" label="Présentation de la collaboration">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={collaboration}
              onChange={(e) => setCollaboration(e.target.value)}
              rows={2}
            />
          )}
        </Field>
        <Field id="af-obj" label="Objectif du programme">
          {(a11y) => (
            <Input
              {...a11y}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          )}
        </Field>
      </section>

      <section className="space-y-3" aria-labelledby="af-target">
        <h3 id="af-target" className="text-title font-extrabold">
          Cible du lien d’affiliation
        </h3>
        <p className="text-caption text-muted-foreground">
          Quand un client ouvre le lien de l’affilié : page publique du service,
          ou paiement direct d’un produit du catalogue.
        </p>
        <div className="flex flex-wrap gap-2">
          {(['service', 'product'] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={targetKind === id}
              onClick={() => setTargetKind(id)}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full border px-3.5 text-[12px] font-bold',
                targetKind === id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-muted',
              )}
            >
              {AFFILIATE_TARGET_LABEL[id]}
            </button>
          ))}
        </div>
        {targetKind === 'product' ? (
          <Field id="af-product" label="Produit concerné">
            {(a11y) => (
              <select
                {...a11y}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-body"
              >
                <option value="">Choisir un article…</option>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {formatPrice(item.price)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        {targetKind === 'product' && catalog.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-caption text-amber-900">
            Aucun produit dans le catalogue. Ajoutez un article avant de cibler
            un paiement produit.
          </p>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="af-commissions">
        <h3 id="af-commissions" className="text-title font-extrabold">
          Configuration des commissions
        </h3>
        <Field
          id="af-rate"
          label="Taux de commission de l’affilié (%)"
          hint={`Plafond technique ${formatRatePct(AFFILIATE_RATE_MAX)}.`}
        >
          {(a11y) => (
            <Input
              {...a11y}
              inputMode="decimal"
              value={affiliatePct}
              onChange={(e) =>
                setAffiliatePct(e.target.value.replace(/[^\d.,]/g, ''))
              }
              placeholder="10"
            />
          )}
        </Field>
        <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 text-caption text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Taux AfriConnect (fixe) : {formatRatePct(platformRate)}. Non
          modifiable par le vendeur.
        </p>
        <div className="space-y-2 rounded-2xl border bg-card p-3.5 shadow-card">
          <p className="text-caption font-semibold text-muted-foreground">
            Simulation sur {formatPrice(10_000)}
          </p>
          <dl className="space-y-1.5 text-body">
            <div className="flex justify-between gap-3">
              <dt>AfriConnect ({formatRatePct(platformRate)})</dt>
              <dd className="font-semibold tabular-nums">
                {formatPrice(sim.platform)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>
                Affilié (
                {rateOk ? formatRatePct(affiliateRate) : '—'})
              </dt>
              <dd className="font-semibold tabular-nums">
                {formatPrice(sim.affiliate)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t pt-1.5">
              <dt className="font-semibold">Vendeur ({vendorPct})</dt>
              <dd className="font-extrabold text-brand tabular-nums">
                {formatPrice(sim.vendor)}
              </dd>
            </div>
          </dl>
        </div>
        <Field id="af-base" label="Base de calcul des commissions">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={commissionBase}
              onChange={(e) => setCommissionBase(e.target.value)}
              rows={2}
            />
          )}
        </Field>
        <Field id="af-excl" label="Frais éventuellement exclus">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={excludedFees}
              onChange={(e) => setExcludedFees(e.target.value)}
              rows={2}
            />
          )}
        </Field>
      </section>

      <section className="space-y-3" aria-labelledby="af-conditions">
        <h3 id="af-conditions" className="text-title font-extrabold">
          Conditions de participation
        </h3>
        <fieldset>
          <legend className="mb-2 text-[12px] font-semibold text-muted-foreground">
            Catégories d’affiliés autorisées
          </legend>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={audience === id}
                onClick={() => setAudience(id)}
                className={cn(
                  'inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-bold',
                  audience === id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-muted',
                )}
              >
                {AFFILIATE_AUDIENCE_LABEL[id]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field id="af-special" label="Conditions particulières" optional>
          {(a11y) => (
            <Textarea
              {...a11y}
              value={specialConditions}
              onChange={(e) => setSpecialConditions(e.target.value)}
              rows={2}
            />
          )}
        </Field>
        <Field id="af-promo" label="Règles de promotion">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={promotionRules}
              onChange={(e) => setPromotionRules(e.target.value)}
              rows={2}
            />
          )}
        </Field>
        <Field id="af-fraud" label="Restrictions fraude / auto-achats">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={fraudRules}
              onChange={(e) => setFraudRules(e.target.value)}
              rows={2}
            />
          )}
        </Field>
      </section>

      <section className="space-y-3" aria-labelledby="af-duree">
        <h3 id="af-duree" className="text-title font-extrabold">
          Durée et disponibilité
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Field id="af-start" label="Date de début">
            {(a11y) => (
              <Input
                {...a11y}
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            )}
          </Field>
          <Field id="af-end" label="Date de fin" optional>
            {(a11y) => (
              <Input
                {...a11y}
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            )}
          </Field>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-muted px-3 text-body">
          <input
            type="checkbox"
            checked={showParticipantCount}
            onChange={(e) => setShowParticipantCount(e.target.checked)}
            className="size-5 accent-[var(--brand)]"
          />
          Afficher le nombre de participants sur la carte publique
        </label>
      </section>

      <section className="space-y-2 rounded-2xl border bg-muted/40 p-3.5">
        <h3 className="text-body font-extrabold">Aperçu carte publique</h3>
        <p className="text-title font-extrabold">{name || 'Nom du programme'}</p>
        <p className="line-clamp-2 text-caption text-muted-foreground">
          {description || 'Description courte…'}
        </p>
        <p className="text-body font-bold text-brand">
          Commission affilié{' '}
          {rateOk ? formatRatePct(affiliateRate) : '—'}
        </p>
        <p className="text-caption text-muted-foreground">
          {AFFILIATE_AUDIENCE_LABEL[audience]} ·{' '}
          {AFFILIATE_TARGET_LABEL[targetKind]}
          {targetKind === 'product' && productId
            ? ` · ${catalog.find((i) => i.id === productId)?.name ?? productId}`
            : ''}
        </p>
      </section>

      {error ? (
        <p role="alert" className="text-caption font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <Button type="button" variant="outline" onClick={() => save('draft')}>
          Enregistrer brouillon
        </Button>
        <Button type="button" onClick={() => save('published')}>
          Publier le programme
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(paths.serviceAffiliate(serviceId))}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
