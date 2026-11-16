import { Link2 } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Field } from '@/components/form/Field'
import { Input } from '@/components/ui/input'
import { DEMO_PARTNERSHIP_LINK } from '@/lib/partnership-link'

interface PartnershipLinkFieldProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  /** Props RHF `register` — si fourni, remplace value/onChange contrôlés. */
  inputProps?: ComponentProps<'input'>
}

/**
 * Champ commun : coller un lien de partenariat (affiliation, forfait, pub…).
 */
export function PartnershipLinkField({
  id = 'partnership-link',
  value,
  onChange,
  error,
  inputProps,
}: PartnershipLinkFieldProps) {
  return (
    <Field
      id={id}
      label="Lien de partenariat"
      optional
      error={error}
      hint="Collez un lien d’affiliation, de forfait ou de publicité. Il s’affichera sous votre contenu."
    >
      {(a11y) => (
        <div className="relative">
          <Link2
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          {inputProps ? (
            <Input
              {...a11y}
              {...inputProps}
              type="url"
              inputMode="url"
              placeholder={DEMO_PARTNERSHIP_LINK}
              className="pl-9"
            />
          ) : (
            <Input
              {...a11y}
              type="url"
              inputMode="url"
              value={value}
              placeholder={DEMO_PARTNERSHIP_LINK}
              className="pl-9"
              onChange={(e) => onChange?.(e.target.value)}
            />
          )}
        </div>
      )}
    </Field>
  )
}
