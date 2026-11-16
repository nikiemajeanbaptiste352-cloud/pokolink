import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { Textarea } from '@/components/ui/input'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { getServiceTypeMeta } from '@/lib/service-types'

/** Étape 2 : logo, photo de couverture, description. */
export function IdentityStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const type = useWatch({ control, name: 'type' })
  const description = useWatch({ control, name: 'description' })
  const meta = getServiceTypeMeta(type)

  return (
    <div className="space-y-6">
      <Controller
        control={control}
        name="logo"
        render={({ field }) => (
          <ImageField
            label="Logo"
            value={field.value}
            onChange={field.onChange}
            icon={meta.icon}
            tone={meta.tone}
            shape="round"
            maxSize={256}
            hint="Il s’affiche sur votre profil public et sur vos tickets."
          />
        )}
      />

      <Controller
        control={control}
        name="cover"
        render={({ field }) => (
          <ImageField
            label="Photo de couverture"
            value={field.value}
            onChange={field.onChange}
            icon={meta.icon}
            tone={meta.tone}
            shape="wide"
            maxSize={960}
            hint="Une photo de votre établissement, de préférence en largeur."
          />
        )}
      />

      <Field
        id="config-description"
        label="Description"
        optional
        hint={`${description.length}/300 caractères`}
        error={errors.description?.message}
      >
        {(a11y) => (
          <Textarea
            {...a11y}
            {...register('description')}
            maxLength={300}
            placeholder="Présentez votre établissement en quelques mots"
          />
        )}
      </Field>
    </div>
  )
}
