import { CreditCard, Smartphone } from 'lucide-react'
import { useId } from 'react'

import { Field } from '@/components/form/Field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type PaymentMethod = 'mobile-money' | 'card'

const PAYMENT_OPTIONS = [
  {
    id: 'mobile-money',
    label: 'Mobile Money',
    description: 'Validation sur votre téléphone',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    description: 'Page sécurisée du prestataire',
    icon: CreditCard,
  },
] as const satisfies readonly {
  id: PaymentMethod
  label: string
  description: string
  icon: typeof Smartphone
}[]

interface PaymentFieldsProps {
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  phone: string
  onPhoneChange: (phone: string) => void
  phoneError: string
  className?: string
}

/**
 * Choix du moyen de paiement et numéro Mobile Money. Interface seule : aucun prestataire
 * n'est branché, le paiement réel est vérifié par le serveur.
 */
export function PaymentFields({
  method,
  onMethodChange,
  phone,
  onPhoneChange,
  phoneError,
  className,
}: PaymentFieldsProps) {
  const uid = useId()

  return (
    <div className={cn('space-y-5', className)}>
      <fieldset>
        <legend className="mb-2 text-body font-semibold">Moyen de paiement</legend>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <label key={option.id} className="relative flex">
                <input
                  type="radio"
                  name={`${uid}-payment-method`}
                  value={option.id}
                  checked={method === option.id}
                  onChange={() => onMethodChange(option.id)}
                  className="peer sr-only"
                />
                <span className="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 bg-card p-3 text-center transition-colors peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:bg-muted">
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-body font-bold">{option.label}</span>
                  <span className="text-caption text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {method === 'mobile-money' ? (
        <Field
          id={`${uid}-phone`}
          label="Numéro Mobile Money"
          error={phoneError}
          hint="Vous validerez le paiement sur ce téléphone."
        >
          {(a11y) => (
            <Input
              {...a11y}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ex. 70 12 34 56"
              value={phone}
              onChange={(changeEvent) =>
                onPhoneChange(changeEvent.target.value.replace(/[^\d\s+]/g, ''))
              }
            />
          )}
        </Field>
      ) : (
        <p className="rounded-xl bg-muted p-3.5 text-caption text-muted-foreground">
          Vous serez redirigé vers la page sécurisée du prestataire. AfriConnect ne
          conserve jamais vos données de carte.
        </p>
      )}
    </div>
  )
}
