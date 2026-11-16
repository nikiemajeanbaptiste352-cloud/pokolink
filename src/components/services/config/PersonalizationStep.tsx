import { AtSign, Check } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Field } from '@/components/form/Field'
import { InputWithIcon } from '@/components/form/InputWithIcon'
import { Textarea } from '@/components/ui/input'
import { ACCENTS } from '@/lib/service-accents'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/** Étape 7 : couleur principale, nom d'utilisateur public, message de bienvenue. */
export function PersonalizationStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const username = useWatch({ control, name: 'username' })
  const welcome = useWatch({ control, name: 'welcomeMessage' })

  const publicBase = `${window.location.origin}${paths.establishment('')}`

  return (
    <div className="space-y-6">
      <Controller
        control={control}
        name="accent"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-body font-semibold">Couleur principale</legend>
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((accent) => (
                <label key={accent.id} className="relative">
                  <input
                    type="radio"
                    name="accent"
                    value={accent.id}
                    checked={field.value === accent.id}
                    onChange={() => field.onChange(accent.id)}
                    className="peer sr-only"
                  />
                  <span
                    style={{ backgroundColor: accent.light }}
                    className={cn(
                      'grid size-11 cursor-pointer place-items-center rounded-full text-white ring-offset-2 ring-offset-background transition-shadow',
                      'peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring',
                    )}
                  >
                    {field.value === accent.id ? (
                      <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                    ) : null}
                    <span className="sr-only">{accent.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      />

      <div className="space-y-2">
        <Field
          id="config-username"
          label="Nom d’utilisateur"
          error={errors.username?.message}
          hint="Il apparaît dans l’adresse de votre profil public et dans votre QR code."
        >
          {(a11y) => (
            <InputWithIcon
              {...a11y}
              {...register('username', { setValueAs: (v: string) => v.toLowerCase() })}
              icon={AtSign}
              className="lowercase"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              maxLength={30}
              placeholder="monactivite"
            />
          )}
        </Field>
        <p className="rounded-xl bg-muted px-3.5 py-3 text-caption break-all text-muted-foreground">
          {publicBase}
          <span className="font-bold text-brand">{username || 'monactivite'}</span>
        </p>
      </div>

      <Field
        id="config-welcome"
        label="Message de bienvenue"
        optional
        hint={`${welcome.length}/200 caractères`}
        error={errors.welcomeMessage?.message}
      >
        {(a11y) => (
          <Textarea
            {...a11y}
            {...register('welcomeMessage')}
            maxLength={200}
            placeholder="Ex: Bienvenue ! Merci de nous avoir choisis 🙏"
          />
        )}
      </Field>
    </div>
  )
}
