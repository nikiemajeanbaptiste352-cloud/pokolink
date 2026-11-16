import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { Field } from '@/components/form/Field'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWalletBalances } from '@/hooks/use-wallet'
import { formatPrice } from '@/lib/format'
import { TEMP_LIMITS, TEMP_WITHDRAWAL_METHODS } from '@/lib/placeholder-wallet'
import {
  createWithdrawalSchema,
  PIN_MAX,
  type WithdrawalValues,
} from '@/lib/wallet-schemas'
import { paths } from '@/routes/paths'

/**
 * Demande de retrait vers un compte Mobile Money. Aucun montant n'est réservé ici : à la
 * création, le serveur déduit le montant du solde disponible et le réserve ; le transfert
 * externe est ensuite effectué à la main par l'administration.
 */
export function WithdrawPage() {
  const [sent, setSent] = useState(false)
  const { available } = useWalletBalances()
  const schema = useMemo(() => createWithdrawalSchema(available), [available])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      methodId: TEMP_WITHDRAWAL_METHODS[0]?.id ?? '',
      amount: '',
      beneficiaryNumber: '',
      beneficiaryName: '',
      pin: '',
    },
  })

  return (
    <>
      <PageHeader
        title="Retirer"
        leading={<BackLink to={paths.wallet} label="Wallet" history />}
      />

      <div className="page-body">

        {sent ? (
          <section className="space-y-4 px-4" aria-label="Demande prête">
            <div className="space-y-2 rounded-2xl bg-info/10 p-4">
              <p className="flex items-center gap-2 text-title font-extrabold">
                <CircleCheck className="size-6 shrink-0 text-info" aria-hidden="true" />
                Demande prête
              </p>
              <p className="text-body">
                Votre demande est enregistrée. Le montant est déduit du solde disponible et
                réservé ; le transfert est ensuite effectué par l’administration. La
                déduction ne signifie pas que le transfert est déjà fait.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                to={paths.walletWithdrawal('ret-1')}
                className={buttonVariants({ size: 'lg', className: 'w-full' })}
              >
                Voir un exemple de suivi
              </Link>
              <Link
                to={paths.wallet}
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'w-full',
                })}
              >
                Retour au Wallet
              </Link>
            </div>
          </section>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit(() => {
              // Le code PIN n'est jamais conservé : le formulaire est vidé.
              reset()
              setSent(true)
            })}
            className="space-y-5 px-4"
          >
            <p className="rounded-xl bg-muted p-3.5 text-body">
              Solde disponible : <strong>{formatPrice(available)}</strong>
            </p>

            <fieldset className="space-y-2">
              <legend className="mb-1.5 text-body font-semibold">Moyen de retrait</legend>
              {TEMP_WITHDRAWAL_METHODS.map((method) => (
                <label key={method.id} className="relative flex">
                  <input
                    type="radio"
                    value={method.id}
                    {...register('methodId')}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-14 w-full cursor-pointer items-center rounded-xl border-2 bg-card px-4 text-body font-semibold peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                    {method.label}
                  </span>
                </label>
              ))}
              {errors.methodId ? (
                <p role="alert" className="text-caption font-medium text-danger">
                  {errors.methodId.message}
                </p>
              ) : null}
            </fieldset>

            <Field
              id="withdraw-amount"
              label="Montant à retirer (FCFA)"
              error={errors.amount?.message}
              hint={`Limites d’exemple : de ${formatPrice(TEMP_LIMITS.withdrawalMin)} à ${formatPrice(TEMP_LIMITS.withdrawalMax)}.`}
            >
              {(control) => (
                <Input
                  {...control}
                  {...register('amount')}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ex. 5000"
                />
              )}
            </Field>

            <Field
              id="withdraw-number"
              label="Numéro Mobile Money du bénéficiaire"
              hint="Numéro Orange Money, Moov Money ou Wave (8 chiffres minimum)."
              error={errors.beneficiaryNumber?.message}
            >
              {(control) => (
                <Input
                  {...control}
                  {...register('beneficiaryNumber')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ex. 70 00 00 00"
                />
              )}
            </Field>

            <Field
              id="withdraw-name"
              label="Nom du bénéficiaire"
              optional
              error={errors.beneficiaryName?.message}
            >
              {(control) => (
                <Input
                  {...control}
                  {...register('beneficiaryName')}
                  autoComplete="name"
                />
              )}
            </Field>

            <Field
              id="withdraw-pin"
              label="Code PIN"
              error={errors.pin?.message}
              hint="Confirmez la demande avec votre code PIN. Il n’est jamais conservé."
            >
              {(control) => (
                <Input
                  {...control}
                  {...register('pin')}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={PIN_MAX}
                />
              )}
            </Field>

            <p className="flex items-start gap-2 text-caption text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Frais de retrait : à définir. Le transfert est effectué manuellement par
              l’administration après validation de votre demande.
            </p>

            <Button type="submit" size="lg" className="w-full">
              Confirmer la demande
            </Button>
          </form>
        )}

        <section
          aria-labelledby="how-title"
          className="mx-4 space-y-2 rounded-2xl border bg-card p-4"
        >
          <h2 id="how-title" className="text-title font-bold">
            Comment ça marche
          </h2>
          <p className="text-body text-muted-foreground">
            Exemple : avec 15 000 FCFA dans le Wallet, un retrait de 5 000 FCFA laisse 10
            000 FCFA disponibles et 5 000 FCFA réservés. Les fonds réservés restent
            comptabilisés mais ne servent plus aux paiements, jusqu’à la fin du retrait.
          </p>
        </section>
      </div>
    </>
  )
}
