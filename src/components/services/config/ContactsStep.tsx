import { Globe, Mail, MessageCircle, Phone, Share2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { Field } from '@/components/form/Field'
import { InputWithIcon } from '@/components/form/InputWithIcon'
import type { ServiceConfigValues } from '@/lib/service-schemas'

/** Étape 4 : téléphone (obligatoire), WhatsApp, e-mail, site web, réseaux sociaux. */
export function ContactsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ServiceConfigValues>()
  const contactErrors = errors.contacts

  return (
    <div className="space-y-6">
      <Field id="contact-phone" label="Téléphone *" error={contactErrors?.phone?.message}>
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('contacts.phone')}
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+221 77 000 00 00"
          />
        )}
      </Field>

      <Field
        id="contact-whatsapp"
        label="WhatsApp"
        optional
        error={contactErrors?.whatsapp?.message}
      >
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('contacts.whatsapp')}
            icon={MessageCircle}
            type="tel"
            inputMode="tel"
            placeholder="+221 77 000 00 00"
          />
        )}
      </Field>

      <Field
        id="contact-email"
        label="E-mail"
        optional
        error={contactErrors?.email?.message}
      >
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('contacts.email')}
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="contact@votreactivite.com"
          />
        )}
      </Field>

      <Field
        id="contact-website"
        label="Site web"
        optional
        error={contactErrors?.website?.message}
      >
        {(a11y) => (
          <InputWithIcon
            {...a11y}
            {...register('contacts.website')}
            icon={Globe}
            type="url"
            inputMode="url"
            placeholder="https://www.votresite.com"
          />
        )}
      </Field>

      <fieldset className="space-y-4">
        <legend className="mb-1.5 text-body font-semibold">
          Réseaux sociaux{' '}
          <span className="font-normal text-muted-foreground">(facultatif)</span>
        </legend>
        {(
          [
            ['facebook', 'Facebook', 'Facebook URL ou @username'],
            ['instagram', 'Instagram', 'Instagram URL ou @username'],
            ['tiktok', 'TikTok', 'TikTok URL ou @username'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <Field
            key={key}
            id={`contact-${key}`}
            label={label}
            error={contactErrors?.[key]?.message}
          >
            {(a11y) => (
              <InputWithIcon
                {...a11y}
                {...register(`contacts.${key}`)}
                icon={Share2}
                placeholder={placeholder}
              />
            )}
          </Field>
        ))}
      </fieldset>
    </div>
  )
}
