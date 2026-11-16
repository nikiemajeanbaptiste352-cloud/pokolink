import { Controller, useFormContext } from 'react-hook-form'

import { Field } from '@/components/form/Field'
import { Media } from '@/components/common/Media'
import { ServiceTypePicker } from '@/components/services/ServiceTypePicker'
import { Input } from '@/components/ui/input'
import type { CreateServiceValues } from '@/lib/service-schemas'
import { getServiceTypeMeta } from '@/lib/service-types'
import type { ServiceType } from '@/types/service'

interface CreationStepProps {
  /** Le type ne change plus une fois l'espace professionnel créé. */
  lockedType?: ServiceType | undefined
}

/**
 * Étape 1 : type d'activité et nom.
 * Utilisée seule (page de création) et dans l'assistant : le formulaire parent contient
 * au minimum les champs `type` et `name`.
 */
export function CreationStep({ lockedType }: CreationStepProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateServiceValues>()

  const locked = lockedType ? getServiceTypeMeta(lockedType) : undefined

  return (
    <div className="space-y-6">
      {locked ? (
        <div className="space-y-1.5">
          <p className="text-body font-semibold">Type d’activité</p>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
            <Media
              icon={locked.icon}
              tone={locked.tone}
              className="size-11 shrink-0 rounded-xl"
            />
            <div>
              <p className="text-body font-bold">{locked.label}</p>
              <p className="text-caption text-muted-foreground">
                Le type ne peut plus être modifié une fois l’espace créé.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <ServiceTypePicker
              label="Type d’activité"
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />
      )}

      <Field
        id="service-name"
        label="Nom de l’établissement"
        error={errors.name?.message}
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register('name')}
            placeholder="Ex. Nikiema Market"
            autoComplete="organization"
            maxLength={60}
          />
        )}
      </Field>
    </div>
  )
}
