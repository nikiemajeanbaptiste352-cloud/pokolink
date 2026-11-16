import { Check, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Media } from '@/components/common/Media'
import { Button } from '@/components/ui/button'
import type { ServiceConfigValues } from '@/lib/service-schemas'
import { PAYMENT_METHODS, getServiceTypeMeta } from '@/lib/service-types'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/** Étape 8 : récapitulatif, ce qui sera créé, et QR code du profil public. */
export function ReviewStep({ isDraft }: { isDraft: boolean }) {
  const { control } = useFormContext<ServiceConfigValues>()
  const values = useWatch({ control })
  const [copied, setCopied] = useState(false)

  const meta = getServiceTypeMeta(values.type ?? 'boutique')
  const methods = PAYMENT_METHODS.filter((m) => values.paymentMethods?.includes(m.id))
  const publicUrl = `${window.location.origin}${paths.establishment(values.username ?? '')}`
  const place = [values.city, values.country].filter(Boolean).join(', ')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Presse-papiers indisponible : le lien reste affiché et sélectionnable.
    }
  }

  // Uniquement ce que la validation crée réellement : pas de promesse sur des modules absents.
  const created = [
    'Profil professionnel',
    'Espace professionnel : tableau de bord, commandes, historique…',
    'Catalogue vide, prêt à remplir',
    `Page publique et QR code (@${values.username ?? ''})`,
    `${methods.length} moyen${methods.length > 1 ? 's' : ''} de paiement déclaré${methods.length > 1 ? 's' : ''}`,
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 rounded-xl border-t-4 border-primary bg-card p-4 shadow-card">
        <Media
          src={values.logo || undefined}
          alt=""
          icon={meta.icon}
          tone={meta.tone}
          className="size-16 shrink-0 rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate text-title font-extrabold">{values.name}</p>
          <p className="text-body font-bold text-brand">{meta.label}</p>
          {place ? (
            <p className="truncate text-caption text-muted-foreground">{place}</p>
          ) : null}
        </div>
      </div>

      <section aria-labelledby="created-title" className="space-y-3">
        <h2 id="created-title" className="sr-only">
          {isDraft ? 'Ce qui sera créé' : 'Ce que contient votre espace'}
        </h2>
        <ul className="space-y-3">
          {created.map((line) => (
            <li key={line} className="flex items-center gap-3 text-body">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" strokeWidth={3} aria-hidden="true" />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="accepted-title" className="space-y-2 border-t pt-4">
        <h2
          id="accepted-title"
          className="text-caption font-semibold text-muted-foreground"
        >
          Paiements acceptés
        </h2>
        <ul className="flex flex-wrap gap-2">
          {methods.map((method) => (
            <li
              key={method.id}
              className={cn(
                'rounded-full px-3 py-1 text-caption font-semibold',
                toneSoft[method.tone],
              )}
            >
              {method.label}
            </li>
          ))}
          <li
            className={cn(
              'rounded-full px-3 py-1 text-caption font-semibold',
              values.allowMerchantCredit
                ? toneSoft.amber
                : 'bg-muted text-muted-foreground',
            )}
          >
            {values.allowMerchantCredit
              ? 'Crédit commerçant activé'
              : 'Crédit commerçant désactivé'}
          </li>
        </ul>
      </section>

      <section aria-labelledby="qr-title" className="space-y-4 border-t pt-6 text-center">
        <h2 id="qr-title" className="text-title font-bold">
          QR code de votre établissement
        </h2>
        <div className="mx-auto w-fit rounded-xl border bg-white p-4 shadow-card">
          <QRCodeSVG
            value={publicUrl}
            size={176}
            marginSize={0}
            role="img"
            title="QR code vers le profil public de l’établissement"
          />
        </div>
        <p className="mx-auto max-w-96 text-body text-muted-foreground">
          Vos clients le scannent pour ouvrir votre profil public et votre catalogue.
          {isDraft ? ' Il sera actif dès la création de votre espace.' : ''}
        </p>
        <p className="mx-auto max-w-full text-caption break-all text-muted-foreground">
          {publicUrl}
        </p>
        <Button variant="outline" onClick={() => void copyLink()}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Lien copié' : 'Copier le lien'}
        </Button>
        <span role="status" className="sr-only">
          {copied ? 'Lien copié dans le presse-papiers' : ''}
        </span>
      </section>
    </div>
  )
}
