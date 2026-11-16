import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Media } from '@/components/common/Media'
import { Field } from '@/components/form/Field'
import { InputWithIcon } from '@/components/form/InputWithIcon'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { getServiceTypeMeta } from '@/lib/service-types'

import { HoursEditor } from './HoursEditor'

/**
 * Étape 5 : paramètres propres à l'activité (champs différents pour un transport, un
 * restaurant, une pharmacie…) et horaires d'ouverture.
 */
export function BusinessStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const type = useWatch({ control, name: 'type' })
  const name = useWatch({ control, name: 'name' })
  const meta = getServiceTypeMeta(type)
  const hoursError = errors.hours
    ? 'Vérifiez les horaires : chaque heure doit être valide.'
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
        <Media
          icon={meta.icon}
          tone={meta.tone}
          className="size-11 shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="truncate text-body font-bold">{name}</p>
          <p className="text-caption font-semibold text-brand">{meta.label}</p>
        </div>
      </div>

      {meta.businessFields.map((field) => (
        <Field
          key={`${type}-${field.id}`}
          id={`business-${field.id}`}
          label={field.label}
          optional
          error={errors.businessDetails?.[field.id]?.message}
        >
          {(a11y) => (
            <InputWithIcon
              {...a11y}
              {...register(`businessDetails.${field.id}`)}
              icon={field.icon}
              inputMode={field.numeric ? 'numeric' : undefined}
              placeholder={field.placeholder}
              maxLength={120}
            />
          )}
        </Field>
      ))}

      <Controller
        control={control}
        name="hours"
        render={({ field }) => (
          <HoursEditor value={field.value} onChange={field.onChange} error={hoursError} />
        )}
      />
    </div>
  )
}
