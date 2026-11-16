import { CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { Field } from '@/components/form/Field'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRewardsBalances } from '@/hooks/use-rewards'
import { TEMP_PROFILE } from '@/lib/placeholder-profile'
import { formatPoints } from '@/lib/rewards-labels'
import { addRewardsTransferRequest } from '@/lib/rewards-requests-store'
import { normalizeRecipient } from '@/lib/wallet-schemas'
import { paths } from '@/routes/paths'

/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

interface Errors {
  recipient?: string
  points?: string
}

/**
 * Transfert de points à un autre utilisateur. Le frontend n'exécute rien : il enregistre une
 * demande « en attente de confirmation ». Le serveur Rewards vérifie le destinataire et le
 * solde, déplace les points et décide du résultat. Le solde affiché ne change jamais ici.
 */
export function RewardsTransferPage() {
  const { available } = useRewardsBalances()
  const [recipient, setRecipient] = useState('')
  const [points, setPoints] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<{ recipient: string; points: number } | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Errors = {}
    const normalized = normalizeRecipient(recipient)
    if (!normalized) next.recipient = 'Saisissez un @identifiant ou un numéro valide.'
    else if (normalized === `@${TEMP_PROFILE.handle}`) {
      next.recipient = 'Vous ne pouvez pas vous transférer des points à vous-même.'
    }
    const amount = Number(points)
    if (!Number.isInteger(amount) || amount <= 0) {
      next.points = 'Saisissez un nombre entier de points supérieur à 0.'
    } else if (amount > available) {
      next.points = `Vous avez ${formatPoints(available)} disponibles.`
    }
    setErrors(next)
    if (next.recipient || next.points || !normalized) return

    addRewardsTransferRequest(
      {
        recipient: normalized,
        points: amount,
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      timestamp(),
    )
    setDone({ recipient: normalized, points: amount })
    setRecipient('')
    setPoints('')
    setNote('')
  }

  return (
    <>
      <PageHeader
        title="Transférer des points"
        leading={<BackLink to={paths.rewards} label="Rewards" history />}
      />

      <div className="space-y-5 py-4">

        {done ? (
          <section className="space-y-4 px-4" role="status" aria-label="Demande envoyée">
            <div className="space-y-2 rounded-2xl bg-info/10 p-4">
              <p className="flex items-center gap-2 text-title font-extrabold">
                <CircleCheck className="size-6 shrink-0 text-info" aria-hidden="true" />
                Transfert demandé
              </p>
              <p className="text-body">
                Votre transfert de {formatPoints(done.points)} à {done.recipient} est « en
                attente de confirmation ». Tant que le serveur n’a pas répondu, votre
                solde ne change pas.
              </p>
            </div>
            <Link
              to={paths.rewardsHistory}
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              Voir l’historique
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setDone(null)}
            >
              Faire un autre transfert
            </Button>
          </section>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 px-4">
            <p className="text-body text-muted-foreground">
              Points disponibles : <strong>{formatPoints(available)}</strong>
            </p>
            <Field
              id="rw-recipient"
              label="Destinataire"
              hint="@identifiant AfriConnect ou numéro de téléphone."
              error={errors.recipient}
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@awa.k"
                  autoComplete="off"
                />
              )}
            </Field>
            <Field id="rw-points" label="Points à transférer" error={errors.points}>
              {(a11y) => (
                <Input
                  {...a11y}
                  inputMode="numeric"
                  value={points}
                  onChange={(e) => setPoints(e.target.value.replace(/\D/g, ''))}
                  placeholder="500"
                />
              )}
            </Field>
            <Field id="rw-note" label="Message" optional>
              {(a11y) => (
                <Input
                  {...a11y}
                  value={note}
                  maxLength={80}
                  onChange={(e) => setNote(e.target.value)}
                />
              )}
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Demander le transfert
            </Button>
          </form>
        )}
      </div>
    </>
  )
}
