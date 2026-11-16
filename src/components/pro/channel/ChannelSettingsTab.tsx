import { zodResolver } from '@hookform/resolvers/zod'
import { Megaphone } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { FilterChips } from '@/components/common/FilterChips'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { SwitchRow } from '@/components/form/SwitchRow'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import {
  CHANNEL_ACCESS_LABEL,
  CHANNEL_MODE_HINT,
  CHANNEL_MODE_LABEL,
  CHANNEL_VISIBILITY_LABEL,
} from '@/lib/pro-labels'
import { channelSettingsSchema, type ChannelSettingsValues } from '@/lib/pro-schemas'
import type { ChannelSettings } from '@/types/pro'

interface ChannelSettingsTabProps {
  channel: ChannelSettings
  onSave: (values: ChannelSettingsValues) => void
  onToggleArchive: () => void
}

const MODES = (['broadcast', 'participatory'] as const).map((id) => ({
  id,
  label: CHANNEL_MODE_LABEL[id],
}))
const VISIBILITIES = (['public', 'private'] as const).map((id) => ({
  id,
  label: CHANNEL_VISIBILITY_LABEL[id],
}))
const ACCESSES = (['free', 'request', 'plan'] as const).map((id) => ({
  id,
  label: CHANNEL_ACCESS_LABEL[id],
}))

/** Réglages du canal : identité, mode, accès, notifications et archivage. */
export function ChannelSettingsTab({
  channel,
  onSave,
  onToggleArchive,
}: ChannelSettingsTabProps) {
  const [confirmingArchive, setConfirmingArchive] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChannelSettingsValues>({
    resolver: zodResolver(channelSettingsSchema),
    defaultValues: {
      name: channel.name,
      description: channel.description,
      avatar: channel.avatar,
      mode: channel.mode,
      visibility: channel.visibility,
      access: channel.access,
      notifications: channel.notifications,
    },
  })
  const mode = useWatch({ control, name: 'mode' })
  const archived = channel.state === 'archived'

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSave)(event)}
      noValidate
      aria-label="Paramètres du canal"
      className="space-y-6 px-4"
    >
      <Controller
        control={control}
        name="avatar"
        render={({ field }) => (
          <ImageField
            label="Photo du canal"
            value={field.value}
            onChange={field.onChange}
            icon={Megaphone}
            tone="violet"
            shape="round"
            hint="Elle s’affiche aussi dans la messagerie des membres."
          />
        )}
      />

      <Field id="channel-name" label="Nom du canal" error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register('name')} maxLength={60} />}
      </Field>

      <Field
        id="channel-description"
        label="Description"
        optional
        error={errors.description?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('description')} maxLength={300} />}
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-body font-semibold">Mode de fonctionnement</legend>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <FilterChips
              label="Mode de fonctionnement"
              items={MODES}
              value={field.value}
              onChange={field.onChange}
              className="px-0"
            />
          )}
        />
        <p className="text-caption text-muted-foreground">{CHANNEL_MODE_HINT[mode]}</p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-body font-semibold">Visibilité</legend>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <FilterChips
              label="Visibilité"
              items={VISIBILITIES}
              value={field.value}
              onChange={field.onChange}
              className="px-0"
            />
          )}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-body font-semibold">Conditions d’accès</legend>
        <Controller
          control={control}
          name="access"
          render={({ field }) => (
            <FilterChips
              label="Conditions d’accès"
              items={ACCESSES}
              value={field.value}
              onChange={field.onChange}
              className="px-0"
            />
          )}
        />
        <p className="text-caption text-muted-foreground">
          Le serveur vérifie ces conditions avant chaque adhésion.
        </p>
      </fieldset>

      <Controller
        control={control}
        name="notifications"
        render={({ field }) => (
          <div className="rounded-xl border bg-card px-3 shadow-card">
            <SwitchRow
              label="Notifications aux membres"
              description="Prévenir les membres à chaque nouvelle publication"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <Button type="submit" size="lg" className="w-full">
        Enregistrer les paramètres
      </Button>

      <div className="space-y-3 border-t pt-4">
        <h3 className="text-body font-bold">
          {archived ? 'Canal archivé' : 'Archiver le canal'}
        </h3>
        <p className="text-caption text-muted-foreground">
          {archived
            ? 'Le canal est masqué et personne ne peut y publier. Vous pouvez le réactiver.'
            : 'Un canal archivé est masqué ; ses publications sont conservées.'}
        </p>
        {confirmingArchive ? (
          <div className="space-y-3 rounded-xl border border-destructive/40 p-3.5">
            <p className="text-body">
              {archived ? 'Réactiver ce canal ?' : 'Archiver ce canal ?'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={archived ? 'default' : 'destructive'}
                onClick={() => {
                  onToggleArchive()
                  setConfirmingArchive(false)
                }}
              >
                {archived ? 'Oui, réactiver' : 'Oui, archiver'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmingArchive(false)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmingArchive(true)}>
            {archived ? 'Réactiver le canal' : 'Archiver le canal'}
          </Button>
        )}
      </div>
    </form>
  )
}
