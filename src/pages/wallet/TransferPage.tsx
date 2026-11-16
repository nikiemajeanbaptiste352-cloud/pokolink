import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { FilterChips } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { Field } from '@/components/form/Field'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWalletBalances } from '@/hooks/use-wallet'
import { formatPrice } from '@/lib/format'
import { TEMP_LIMITS } from '@/lib/placeholder-wallet'
import { TEMP_PROFILE } from '@/lib/placeholder-profile'
import { addWalletPayment } from '@/lib/wallet-payments-store'
import { createP2PSchema, normalizeRecipient, type P2PValues } from '@/lib/wallet-schemas'
import { paths } from '@/routes/paths'

type Mode = 'send' | 'request'

const MODES = [
  { id: 'send', label: 'Envoyer' },
  { id: 'request', label: 'Demander' },
] as const satisfies readonly { id: Mode; label: string }[]

interface Draft {
  recipient: string
  amount: number
  note: string
}

const EMPTY: P2PValues = { recipient: '', amount: '', note: '' }

function toDraft(values: P2PValues): Draft | null {
  const recipient = normalizeRecipient(values.recipient)
  const amount = Number(values.amount)
  if (!recipient || !Number.isInteger(amount) || amount <= 0) return null
  return { recipient, amount, note: values.note.trim() }
}

/**
 * Paiement entre utilisateurs (P2P) depuis le Wallet : envoyer de l'argent ou en demander à
 * un autre utilisateur. Le frontend n'exécute rien : il envoie une demande, puis le serveur
 * vérifie le destinataire et le solde, débite et crédite, et décide du résultat. Le solde
 * affiché ne change jamais ici.
 */
/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

export function TransferPage() {
  const [mode, setMode] = useState<Mode>('send')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [done, setDone] = useState<{ mode: Mode; draft: Draft } | null>(null)
  const { available } = useWalletBalances()
  const schema = useMemo(() => createP2PSchema(TEMP_PROFILE.handle), [])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<P2PValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })

  function changeMode(next: Mode) {
    setMode(next)
    setDraft(null)
    setDone(null)
    reset(EMPTY)
  }

  function submit(values: P2PValues) {
    const next = toDraft(values)
    if (!next) return
    if (mode === 'send') {
      setDraft(next)
      return
    }
    // Demande d'argent : aucun débit pour l'utilisateur, donc pas de code PIN.
    addWalletPayment(
      {
        purpose: 'p2p_request',
        title: `Demande à ${next.recipient}`,
        amount: next.amount,
        recipient: next.recipient,
        ...(next.note ? { detail: next.note } : {}),
      },
      timestamp(),
    )
    setDone({ mode, draft: next })
    reset(EMPTY)
  }

  return (
    <>
      <PageHeader
        title="Envoyer / Demander"
        leading={<BackLink to={paths.wallet} label="Wallet" history />}
      />

      <div className="page-body">

        <FilterChips
          label="Type d’opération"
          items={MODES}
          value={mode}
          onChange={changeMode}
        />

        {done ? (
          <section className="space-y-4 px-4" role="status" aria-label="Demande envoyée">
            <div className="space-y-2 rounded-2xl bg-info/10 p-4">
              <p className="flex items-center gap-2 text-title font-extrabold">
                <CircleCheck className="size-6 shrink-0 text-info" aria-hidden="true" />
                {done.mode === 'send' ? 'Envoi demandé' : 'Demande envoyée'}
              </p>
              <p className="text-body">
                {done.mode === 'send'
                  ? `Votre envoi de ${formatPrice(done.draft.amount)} à ${done.draft.recipient} est « en attente de confirmation ». Le serveur vérifie le destinataire et votre solde, puis débite votre Wallet : tant qu’il n’a pas répondu, votre solde ne change pas.`
                  : `Votre demande de ${formatPrice(done.draft.amount)} à ${done.draft.recipient} est « en attente de confirmation ». ${done.draft.recipient} doit l’accepter : rien n’est reçu tant que le serveur n’a pas confirmé.`}
              </p>
            </div>
            <Link
              to={paths.wallet}
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              Voir dans mon Wallet
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setDone(null)}
            >
              Faire une autre opération
            </Button>
          </section>
        ) : mode === 'send' && draft ? (
          <section className="space-y-4 px-4" aria-label="Confirmer l’envoi">
            <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Destinataire</dt>
                <dd className="text-body font-extrabold break-all">{draft.recipient}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Montant</dt>
                <dd className="text-title font-extrabold tabular-nums">
                  {formatPrice(draft.amount)}
                </dd>
              </div>
              {draft.note ? (
                <div className="flex items-baseline justify-between gap-3 py-3">
                  <dt className="text-body text-muted-foreground">Message</dt>
                  <dd className="min-w-0 text-right text-body break-words">
                    {draft.note}
                  </dd>
                </div>
              ) : null}
            </dl>

            <WalletPaymentForm
              purpose="p2p_send"
              title={`Envoi à ${draft.recipient}`}
              {...(draft.note ? { detail: draft.note } : {})}
              recipient={draft.recipient}
              beneficiary={{
                name: draft.recipient,
                ...(draft.recipient.startsWith('@')
                  ? { handle: draft.recipient.slice(1) }
                  : {}),
              }}
              amount={draft.amount}
              fees={0}
              waitingLabel="Confirmer"
              actionLabel="Confirmer le paiement"
              onSent={() => {
                // L'identifiant de la demande est déjà dans le Wallet ; ici on poursuit l'écran.
                setDone({ mode, draft })
                setDraft(null)
                reset(EMPTY)
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setDraft(null)}
            >
              Modifier
            </Button>
          </section>
        ) : (
          <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5 px-4">
            {mode === 'send' ? (
              <p className="rounded-xl bg-muted p-3.5 text-body">
                Solde disponible : <strong>{formatPrice(available)}</strong>
              </p>
            ) : (
              <p className="rounded-xl bg-muted p-3.5 text-body">
                Demandez de l’argent à un autre utilisateur : il reçoit votre demande et
                choisit de l’accepter ou non.
              </p>
            )}

            <Field
              id="p2p-recipient"
              label={mode === 'send' ? 'Destinataire' : 'Demander à'}
              hint="Un @identifiant AfriConnect ou un numéro de téléphone."
              error={errors.recipient?.message}
            >
              {(control) => (
                <Input
                  {...control}
                  {...register('recipient')}
                  placeholder="@awa.k ou +226 70 00 00 00"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              )}
            </Field>

            <Field
              id="p2p-amount"
              label="Montant (FCFA)"
              hint={`De ${formatPrice(TEMP_LIMITS.p2pMin)} à ${formatPrice(TEMP_LIMITS.p2pMax)}.`}
              error={errors.amount?.message}
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

            <Field id="p2p-note" label="Message" optional error={errors.note?.message}>
              {(control) => (
                <Input
                  {...control}
                  {...register('note')}
                  maxLength={100}
                  placeholder={
                    mode === 'send' ? 'Ex. Merci pour hier' : 'Ex. Ma part du repas'
                  }
                />
              )}
            </Field>

            <Button type="submit" size="lg" className="w-full">
              {mode === 'send' ? 'Continuer' : 'Envoyer la demande'}
            </Button>

            <p className="flex items-start gap-2 text-caption text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Le serveur vérifie le destinataire, le solde et les limites. Frais : à
              définir.
            </p>
          </form>
        )}
      </div>
    </>
  )
}
