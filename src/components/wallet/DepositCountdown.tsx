import { Timer } from 'lucide-react'

import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'

function format(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Compte à rebours de la demande (5 minutes). En production, l'échéance et l'heure de
 * référence viennent du serveur ; ici, l'horloge de l'appareil sert de démonstration.
 */
export function DepositCountdown({ expiresAt }: { expiresAt: number }) {
  const now = useNow(1000)
  const remaining = expiresAt - now
  const expired = remaining <= 0

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={expired ? 'Demande expirée' : `Temps restant ${format(remaining)}`}
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl p-4',
        expired ? 'bg-destructive/10' : 'bg-info/10',
      )}
    >
      <span className="flex items-center gap-2 text-body font-semibold">
        <Timer className="size-5" aria-hidden="true" />
        {expired ? 'Demande expirée' : 'Temps restant'}
      </span>
      <span className="text-headline font-extrabold tabular-nums" aria-hidden="true">
        {expired ? '00:00' : format(remaining)}
      </span>
    </div>
  )
}
