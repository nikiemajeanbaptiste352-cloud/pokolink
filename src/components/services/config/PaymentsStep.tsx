import { Check } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { FilterChips } from '@/components/common/FilterChips'
import { Field } from '@/components/form/Field'
import { SwitchRow } from '@/components/form/SwitchRow'
import { Input } from '@/components/ui/input'
import { PAYMENT_METHODS, TICKET_PAPERS } from '@/lib/service-types'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

import { TicketPreview } from './TicketPreview'

/** Étape 6 : moyens de paiement acceptés et paramètres des tickets. */
export function PaymentsStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const name = useWatch({ control, name: 'name' })
  const logo = useWatch({ control, name: 'logo' })
  const ticket = useWatch({ control, name: 'ticket' })
  const username = useWatch({ control, name: 'username' })
  const wallet =
    PAYMENT_METHODS.find((method) => method.id === 'wallet') ?? PAYMENT_METHODS[0]!
  const WalletIcon = wallet.icon

  return (
    <div className="space-y-8">
      <fieldset aria-describedby="payments-note">
        <legend className="mb-1.5 text-body font-semibold">Moyen de paiement</legend>
        <div className="flex min-h-16 items-center gap-3 rounded-xl border-2 border-primary bg-accent p-3 shadow-card">
          <span
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-full',
              toneSoft[wallet.tone],
            )}
          >
            <WalletIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body font-bold">{wallet.label}</span>
            <span className="block text-caption text-muted-foreground">
              Seul moyen de paiement accepté
            </span>
          </span>
          <Check className="size-5 shrink-0 text-brand" aria-hidden="true" />
        </div>
        <p id="payments-note" className="mt-1.5 text-caption text-muted-foreground">
          Vos clients paient avec leur Wallet AfriConnect : le montant vous est transféré
          par le serveur. Aucun autre moyen de paiement n’est proposé.
        </p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-body font-semibold">Crédit commerçant</legend>
        <div className="rounded-xl border bg-card px-3 shadow-card">
          <Controller
            control={control}
            name="allowMerchantCredit"
            render={({ field }) => (
              <SwitchRow
                label="Autoriser le crédit commerçant"
                description="Si activé, autorisez ensuite chaque article dans Crédits clients → Configurer. AfriConnect ne prête pas."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </fieldset>

      <section aria-labelledby="ticket-settings-title" className="space-y-5">
        <h3 id="ticket-settings-title" className="text-title font-bold">
          Paramètres des tickets
        </h3>

        <Field
          id="ticket-header"
          label="Texte en haut du ticket"
          optional
          error={errors.ticket?.header?.message}
        >
          {(a11y) => (
            <Input
              {...a11y}
              {...register('ticket.header')}
              maxLength={80}
              placeholder="Ex. Le goût du pays"
            />
          )}
        </Field>
        <Field
          id="ticket-footer"
          label="Texte en bas du ticket"
          optional
          error={errors.ticket?.footer?.message}
        >
          {(a11y) => <Input {...a11y} {...register('ticket.footer')} maxLength={120} />}
        </Field>

        <div className="divide-y rounded-xl border bg-card px-3 shadow-card">
          <Controller
            control={control}
            name="ticket.showLogo"
            render={({ field }) => (
              <SwitchRow
                label="Afficher le logo"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="ticket.showQr"
            render={({ field }) => (
              <SwitchRow
                label="Afficher le QR code"
                description="Mène vos clients vers votre profil public"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="ticket.paper"
          render={({ field }) => (
            <div className="space-y-1.5">
              <p className="text-body font-semibold">Largeur du papier</p>
              <FilterChips
                label="Largeur du papier"
                items={TICKET_PAPERS}
                value={field.value}
                onChange={field.onChange}
                className="px-0"
              />
            </div>
          )}
        />

        <div className="rounded-xl bg-muted p-4">
          <p className="mb-3 text-center text-caption font-semibold text-muted-foreground">
            Aperçu
          </p>
          <TicketPreview
            name={name}
            logo={logo}
            header={ticket.header}
            footer={ticket.footer}
            showLogo={ticket.showLogo}
            showQr={ticket.showQr}
            paper={ticket.paper}
            qrValue={`${window.location.origin}${paths.establishment(username || 'exemple')}`}
          />
        </div>
      </section>
    </div>
  )
}
