import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  Crown,
  Eye,
  EyeOff,
  Pause,
  Pencil,
  Play,
  Plus,
  Send,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Media } from '@/components/common/Media'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { SwitchRow } from '@/components/form/SwitchRow'
import { StatusPill } from '@/components/pro/shared'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatPrice } from '@/lib/format'
import { PLAN_DURATION_LABEL, PLAN_STATUS_LABEL } from '@/lib/pro-labels'
import { PLAN_DURATIONS, planSchema, type PlanValues } from '@/lib/pro-schemas'
import { createId } from '@/lib/ids'
import type { Plan, PlanDuration, PlanStatus } from '@/types/pro'

interface PlanViewProps {
  name: string
  description: string
  price: number
  duration: PlanDuration
  benefits: readonly string[]
  conditions: string
  image: string
  status?: PlanStatus
}

/** Aspect d'un forfait tel que le verront les clients (carte et aperçu). */
export function PlanView({
  name,
  description,
  price,
  duration,
  benefits,
  conditions,
  image,
  status,
}: PlanViewProps) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <Media
          src={image || undefined}
          alt=""
          icon={Crown}
          tone="gold"
          className="size-14 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title font-extrabold">
            {name || 'Nom du forfait'}
          </h3>
          {description ? (
            <p className="line-clamp-2 text-body text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {status ? <StatusPill>{PLAN_STATUS_LABEL[status]}</StatusPill> : null}
      </div>
      <p className="text-headline font-extrabold">
        {Number.isFinite(price) && price > 0 ? formatPrice(price) : '— FCFA'}
        <span className="text-body font-normal text-muted-foreground">
          {' '}
          · {PLAN_DURATION_LABEL[duration]}
        </span>
      </p>
      {benefits.length > 0 ? (
        <ul className="space-y-1.5">
          {benefits.map((benefit, index) => (
            <li key={`${benefit}-${index}`} className="flex items-start gap-2 text-body">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {benefit || '…'}
            </li>
          ))}
        </ul>
      ) : null}
      {conditions ? (
        <p className="text-caption text-muted-foreground">Conditions : {conditions}</p>
      ) : null}
    </div>
  )
}

interface PlanCardProps {
  plan: Plan
  subscribers: number
  onEdit: (plan: Plan) => void
  onSetStatus: (plan: Plan, status: PlanStatus) => void
}

/** Carte d'un forfait du prestataire, avec Modifier, Publier et Suspendre. */
export function PlanCard({ plan, subscribers, onEdit, onSetStatus }: PlanCardProps) {
  return (
    <div className="space-y-2">
      <PlanView {...plan} status={plan.status} />
      <p className="px-1 text-caption text-muted-foreground">
        {subscribers} souscripteur{subscribers > 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => onEdit(plan)}>
          <Pencil aria-hidden="true" />
          Modifier<span className="sr-only"> : {plan.name}</span>
        </Button>
        {plan.status === 'draft' ? (
          <Button onClick={() => onSetStatus(plan, 'active')}>
            <Send aria-hidden="true" />
            Publier<span className="sr-only"> : {plan.name}</span>
          </Button>
        ) : null}
        {plan.status === 'active' ? (
          <Button variant="ghost" onClick={() => onSetStatus(plan, 'suspended')}>
            <Pause aria-hidden="true" />
            Suspendre<span className="sr-only"> : {plan.name}</span>
          </Button>
        ) : null}
        {plan.status === 'suspended' ? (
          <Button variant="ghost" onClick={() => onSetStatus(plan, 'active')}>
            <Play aria-hidden="true" />
            Réactiver<span className="sr-only"> : {plan.name}</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

interface PlanFormSheetProps {
  open: boolean
  plan: Plan | null
  onClose: () => void
  onSave: (plan: Plan, published: boolean) => void
}

/** Création ou modification d'un forfait : Enregistrer, Prévisualiser, Publier. */
export function PlanFormSheet({ open, plan, onClose, onSave }: PlanFormSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={plan ? 'Modifier le forfait' : 'Créer un forfait'}
      subtitle="Offre commerciale proposée à vos clients."
    >
      <PlanForm plan={plan} onSave={onSave} onCancel={onClose} />
    </BottomSheet>
  )
}

function PlanForm({
  plan,
  onSave,
  onCancel,
}: {
  plan: Plan | null
  onSave: PlanFormSheetProps['onSave']
  onCancel: () => void
}) {
  const [previewing, setPreviewing] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name ?? '',
      description: plan?.description ?? '',
      ...(plan ? { price: plan.price } : {}),
      duration: plan?.duration ?? 'monthly',
      benefits: plan?.benefits.map((text) => ({ text })) ?? [{ text: '' }],
      conditions: plan?.conditions ?? '',
      image: plan?.image ?? '',
      active: plan ? plan.status === 'active' : false,
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'benefits' })
  const watched = useWatch({ control })

  function submit(publish: boolean) {
    return handleSubmit((values) => {
      let status: PlanStatus = values.active ? 'active' : 'draft'
      if (!values.active && plan?.status === 'suspended') status = 'suspended'
      if (publish) status = 'active'
      onSave(
        {
          id: plan?.id ?? createId(),
          name: values.name,
          description: values.description,
          price: values.price,
          duration: values.duration,
          benefits: values.benefits.map((benefit) => benefit.text),
          conditions: values.conditions,
          image: values.image,
          status,
          createdAt: plan?.createdAt ?? new Date().toISOString(),
        },
        publish,
      )
    })
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="space-y-5">
      <Field id="plan-name" label="Nom du forfait" error={errors.name?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register('name')}
            maxLength={40}
            placeholder="Ex. Premium"
          />
        )}
      </Field>

      <Field
        id="plan-description"
        label="Description"
        optional
        error={errors.description?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('description')} maxLength={200} />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="plan-price" label="Prix (FCFA)" error={errors.price?.message}>
          {(a11y) => (
            <Input
              {...a11y}
              {...register('price', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Ex. 5000"
            />
          )}
        </Field>
        <Field id="plan-duration" label="Durée">
          {(a11y) => (
            <Select {...a11y} {...register('duration')}>
              {PLAN_DURATIONS.map((id) => (
                <option key={id} value={id}>
                  {PLAN_DURATION_LABEL[id]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-body font-semibold">Avantages inclus</legend>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <Field
              id={`benefit-${index}`}
              label={`Avantage ${index + 1}`}
              error={errors.benefits?.[index]?.text?.message}
              className="min-w-0 flex-1"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register(`benefits.${index}.text`)}
                  maxLength={80}
                  placeholder="Ex. Livraison prioritaire"
                />
              )}
            </Field>
            {fields.length > 1 ? (
              <Button
                size="icon"
                variant="ghost"
                className="mt-7"
                aria-label={`Retirer l’avantage ${index + 1}`}
                onClick={() => remove(index)}
              >
                <X aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        ))}
        {errors.benefits?.message ? (
          <p role="alert" className="text-caption font-medium text-danger">
            {errors.benefits.message}
          </p>
        ) : null}
        <Button variant="outline" onClick={() => append({ text: '' })}>
          <Plus aria-hidden="true" />
          Ajouter un avantage
        </Button>
      </fieldset>

      <Field
        id="plan-conditions"
        label="Conditions"
        optional
        error={errors.conditions?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('conditions')} maxLength={300} />}
      </Field>

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageField
            label="Image"
            value={field.value}
            onChange={field.onChange}
            icon={Crown}
            tone="gold"
            maxSize={640}
            shape="wide"
          />
        )}
      />

      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <div className="rounded-xl border bg-card px-3 shadow-card">
            <SwitchRow
              label="Forfait actif"
              description="Inactif : visible uniquement par vous"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      {previewing ? (
        <div className="space-y-2" aria-live="polite">
          <p className="text-caption font-bold">Aperçu pour vos clients</p>
          <PlanView
            name={watched.name ?? ''}
            description={watched.description ?? ''}
            price={Number(watched.price)}
            duration={watched.duration ?? 'monthly'}
            benefits={(watched.benefits ?? []).map((b) => b?.text ?? '').filter(Boolean)}
            conditions={watched.conditions ?? ''}
            image={watched.image ?? ''}
          />
        </div>
      ) : null}

      <div className="grid gap-3">
        <Button type="button" size="lg" onClick={() => void submit(true)()}>
          Publier
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
