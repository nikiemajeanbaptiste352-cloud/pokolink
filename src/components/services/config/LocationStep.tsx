import { Building2, LocateFixed, MapPin, Navigation, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { FilterChips } from '@/components/common/FilterChips'
import { Field } from '@/components/form/Field'
import { InputWithIcon } from '@/components/form/InputWithIcon'
import { Button } from '@/components/ui/button'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { COUNTRIES } from '@/lib/service-types'

/** Étape 3 : pays, ville, adresse et position GPS. */
export function LocationStep() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const latitude = useWatch({ control, name: 'latitude' })
  const longitude = useWatch({ control, name: 'longitude' })
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState<string>()

  function locate() {
    setGpsError(undefined)
    if (!('geolocation' in navigator)) {
      setGpsError('La localisation n’est pas disponible sur cet appareil.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 5 décimales ≈ 1 m : suffisant et sans fausse précision.
        setValue('latitude', Number(position.coords.latitude.toFixed(5)), {
          shouldDirty: true,
        })
        setValue('longitude', Number(position.coords.longitude.toFixed(5)), {
          shouldDirty: true,
        })
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? 'Autorisez la localisation dans votre navigateur, ou saisissez l’adresse.'
            : 'Position introuvable. Réessayez ou saisissez l’adresse.',
        )
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  const hasPosition = latitude !== null && longitude !== null

  return (
    <div className="space-y-6">
      <Controller
        control={control}
        name="country"
        render={({ field }) => (
          <div className="space-y-1.5">
            <p className="text-body font-semibold">Pays</p>
            <FilterChips
              label="Pays"
              items={COUNTRIES.map((c) => ({ id: c, label: c }))}
              value={field.value}
              onChange={field.onChange}
              className="-mx-4"
            />
            {errors.country ? (
              <p role="alert" className="text-caption font-medium text-danger">
                {errors.country.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Field id="config-city" label="Ville *" error={errors.city?.message}>
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('city')}
            icon={Building2}
            autoComplete="address-level2"
            placeholder="Ex: Dakar, Abidjan, Bamako…"
          />
        )}
      </Field>

      <Field
        id="config-address"
        label="Adresse complète"
        optional
        error={errors.address?.message}
      >
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('address')}
            icon={MapPin}
            autoComplete="street-address"
            placeholder="Rue, quartier, point de repère…"
          />
        )}
      </Field>

      <div className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full border-primary/40 bg-accent text-accent-foreground hover:bg-accent/70"
          disabled={locating}
          onClick={locate}
        >
          <LocateFixed aria-hidden="true" />
          {locating ? 'Localisation en cours…' : 'Utiliser ma position GPS actuelle'}
        </Button>

        <div
          aria-live="polite"
          className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-xl border bg-card p-4 text-center"
        >
          <Navigation className="size-7 text-brand" aria-hidden="true" />
          {hasPosition ? (
            <>
              <p className="text-body font-bold">Position enregistrée</p>
              <p className="text-caption text-muted-foreground">
                {latitude}, {longitude}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => {
                  setValue('latitude', null, { shouldDirty: true })
                  setValue('longitude', null, { shouldDirty: true })
                }}
              >
                <X aria-hidden="true" />
                Effacer la position
              </Button>
            </>
          ) : (
            <>
              <p className="text-body font-bold">Position GPS</p>
              <p className="text-caption text-muted-foreground">
                Appuyez sur GPS pour localiser votre établissement
              </p>
            </>
          )}
        </div>
        {gpsError ? (
          <p role="alert" className="text-caption font-medium text-danger">
            {gpsError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
