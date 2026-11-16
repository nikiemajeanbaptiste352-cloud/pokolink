import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { Field } from '@/components/form/Field'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MerchantDepositCard } from '@/components/wallet/MerchantDepositCard'
import { useProfile } from '@/hooks/use-profile'
import { formatPrice } from '@/lib/format'
import { splitName } from '@/lib/payment-labels'
import {
  getMethodLabel,
  TEMP_DEPOSIT_METHODS,
  TEMP_LIMITS,
  TEMP_MERCHANT_NUMBER,
} from '@/lib/placeholder-wallet'
import { toLocalInput } from '@/lib/pro-labels'
import {
  depositRequestSchema,
  type DepositRequestValues,
} from '@/lib/wallet-schemas'
import { safeReturnPath } from '@/lib/safe-return-path'
import { paths } from '@/routes/paths'

/**
 * Demande de dépôt Wallet : l’utilisateur a déjà transféré hors app vers le numéro
 * Mobile Money, puis déclare les preuves (nom, ID, date/heure) pour le rapprochement
 * backend et le crédit automatique.
 */
export function DepositPage() {
  const [searchParams] = useSearchParams()
  const returnTo = safeReturnPath(searchParams.get('retour'))
  const methodParam = searchParams.get('methode') ?? ''
  const methodOk = TEMP_DEPOSIT_METHODS.some((m) => m.id === methodParam)
  const methodLabel = methodOk ? getMethodLabel(methodParam) : undefined
  const [sent, setSent] = useState(false)

  const backTo = returnTo ?? paths.wallet
  const backLabel = returnTo ? 'Retour au paiement' : 'Wallet'

  return (
    <>
      <PageHeader
        title="Déclarer un dépôt"
        leading={<BackLink to={backTo} label={backLabel} history={!returnTo} />}
      />

      <div className="page-body">
        {sent ? (
          <SentStep returnTo={returnTo} />
        ) : (
          <>
            {methodLabel ? (
              <p className="mx-4 mb-3 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-[13px] font-semibold text-brand">
                Moyen choisi : {methodLabel}. Transférez vers le numéro marchand puis
                déclarez la preuve ci-dessous.
              </p>
            ) : null}
            <MerchantDepositCard />
            <DepositRequestForm onSent={() => setSent(true)} />
          </>
        )}
      </div>
    </>
  )
}

function DepositRequestForm({ onSent }: { onSent: () => void }) {
  const profile = useProfile()
  const names = splitName(profile.name)
  const [defaultTime] = useState(() => toLocalInput(Date.now()))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositRequestValues>({
    resolver: zodResolver(depositRequestSchema),
    defaultValues: {
      firstName: names.firstName,
      lastName: names.lastName,
      amount: '',
      transactionId: '',
      transferredAt: defaultTime,
      senderNumber: profile.phone ?? '',
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(() => onSent())}
      className="space-y-4 px-4"
      aria-label="Demande de dépôt"
    >
      <div className="space-y-1">
        <h2 className="text-[15px] font-extrabold tracking-tight">
          Demande de dépôt
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Remplissez après le transfert externe. Ces références servent de preuve au
          backend pour rapprocher la notification reçue sur le numéro{' '}
          <strong className="text-foreground">{TEMP_MERCHANT_NUMBER}</strong> et
          créditer votre Wallet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field id="deposit-first" label="Prénom" error={errors.firstName?.message}>
          {(control) => (
            <Input
              {...control}
              {...register('firstName')}
              autoComplete="given-name"
            />
          )}
        </Field>
        <Field id="deposit-last" label="Nom" error={errors.lastName?.message}>
          {(control) => (
            <Input
              {...control}
              {...register('lastName')}
              autoComplete="family-name"
            />
          )}
        </Field>
      </div>

      <Field
        id="deposit-amount"
        label="Montant transféré (FCFA)"
        hint={`De ${formatPrice(TEMP_LIMITS.depositMin)} à ${formatPrice(TEMP_LIMITS.depositMax)}.`}
        error={errors.amount?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('amount')}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 10000"
          />
        )}
      </Field>

      <Field
        id="deposit-txid"
        label="Identifiant de transaction"
        hint="ID affiché sur le SMS ou l’appli Mobile Money après l’envoi."
        error={errors.transactionId?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('transactionId')}
            autoComplete="off"
            placeholder="Ex. MP260314.1234.A12345"
          />
        )}
      </Field>

      <Field
        id="deposit-time"
        label="Date et heure du transfert"
        hint="Doivent correspondre à la notification reçue côté Mobile Money."
        error={errors.transferredAt?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('transferredAt')}
            type="datetime-local"
            className="min-w-0 max-w-full"
          />
        )}
      </Field>

      <Field
        id="deposit-sender"
        label="Votre numéro Mobile Money"
        hint="Numéro depuis lequel vous avez envoyé l’argent."
        error={errors.senderNumber?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('senderNumber')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex. 70 00 00 00"
          />
        )}
      </Field>

      <p className="flex items-start gap-2 text-caption text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Le crédit est automatique dès que le backend retrouve la même transaction dans
        les notifications du compte marchand. Sans correspondance, la demande reste en
        vérification.
      </p>

      <Button type="submit" size="lg" className="w-full rounded-full font-bold">
        Envoyer ma demande de dépôt
      </Button>
    </form>
  )
}

function SentStep({ returnTo }: { returnTo: string | null }) {
  return (
    <section className="space-y-4 px-4" aria-label="Demande enregistrée">
      <div className="space-y-2 rounded-2xl bg-info/10 p-4">
        <p className="flex items-center gap-2 text-title font-extrabold">
          <CircleCheck className="size-6 shrink-0 text-info" aria-hidden="true" />
          Demande prête
        </p>
        <p className="text-body">
          Votre demande est enregistrée. L’ID de transaction, la date/heure et le montant
          seront rapprochés des notifications Mobile Money du numéro marchand. En cas de
          correspondance, votre Wallet est crédité automatiquement.
        </p>
      </div>
      <div className="space-y-2">
        {returnTo ? (
          <Link
            to={returnTo}
            className={buttonVariants({ size: 'lg', className: 'w-full rounded-full' })}
          >
            Reprendre le paiement
          </Link>
        ) : (
          <Link
            to={paths.walletDeposit('dep-3')}
            className={buttonVariants({ size: 'lg', className: 'w-full rounded-full' })}
          >
            Voir un exemple de suivi
          </Link>
        )}
        <Link
          to={paths.wallet}
          className={buttonVariants({
            variant: 'outline',
            size: 'lg',
            className: 'w-full rounded-full',
          })}
        >
          Retour au Wallet
        </Link>
      </div>
    </section>
  )
}
