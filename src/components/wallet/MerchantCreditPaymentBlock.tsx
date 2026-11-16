import { Handshake, Info } from 'lucide-react'

import { Field } from '@/components/form/Field'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MerchantCreditPaymentBlockProps {
  merchantName: string
  eligibleAmount: number
  deferred: number
  onDeferredChange: (value: number) => void
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  confirmed: boolean
  onConfirmedChange: (value: boolean) => void
  /** Dette ouverte chez ce commerçant (remboursement proposé). */
  existingBalance?: number
  repayAmount: number
  onRepayAmountChange: (value: number) => void
  repayEnabled: boolean
  onRepayEnabledChange: (value: boolean) => void
  repayConfirmed: boolean
  onRepayConfirmedChange: (value: boolean) => void
  className?: string
}

/**
 * Option crédit commerçant sur la page de paiement unique.
 * Visible uniquement si au moins un article autorise le crédit.
 */
export function MerchantCreditPaymentBlock({
  merchantName,
  eligibleAmount,
  deferred,
  onDeferredChange,
  enabled,
  onEnabledChange,
  confirmed,
  onConfirmedChange,
  existingBalance = 0,
  repayAmount,
  onRepayAmountChange,
  repayEnabled,
  onRepayEnabledChange,
  repayConfirmed,
  onRepayConfirmedChange,
  className,
}: MerchantCreditPaymentBlockProps) {
  // Affiché seulement si le vendeur a activé le crédit (établissement + articles)
  // ou s’il reste une dette à rembourser chez ce commerçant.
  if (eligibleAmount <= 0 && existingBalance <= 0) return null

  return (
    <section
      aria-label="Crédit commerçant"
      className={cn('space-y-2.5 px-3.5 py-2.5', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[13px] font-extrabold">
          <Handshake className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
          Crédit commerçant
        </h2>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Distinct du Wallet. {merchantName} accepte éventuellement de reporter une
        partie du paiement. AfriConnect ne prête pas.
      </p>

      {eligibleAmount > 0 ? (
        <div className="space-y-2 rounded-xl border bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-bold">Reporter une partie</p>
              <p className="text-[11px] text-muted-foreground">
                Max {formatPrice(eligibleAmount)} (articles autorisés)
              </p>
            </div>
            <Switch
              label="Activer le crédit commerçant"
              checked={enabled}
              onCheckedChange={(v) => {
                onEnabledChange(v)
                if (!v) {
                  onDeferredChange(0)
                  onConfirmedChange(false)
                }
              }}
            />
          </div>

          {enabled ? (
            <>
              <Field id="merchant-credit-amount" label="Montant reporté (dette)">
                {(a11y) => (
                  <Input
                    {...a11y}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={eligibleAmount}
                    step={100}
                    value={deferred || ''}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      onDeferredChange(
                        Number.isFinite(n)
                          ? Math.min(eligibleAmount, Math.max(0, Math.floor(n)))
                          : 0,
                      )
                      onConfirmedChange(false)
                    }}
                  />
                )}
              </Field>
              <p className="text-[11px] font-semibold text-brand">
                Dette envers {merchantName} : {formatPrice(deferred)}
              </p>
              <label className="flex items-start gap-2 text-[12px]">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--brand)]"
                  checked={confirmed}
                  onChange={(e) => onConfirmedChange(e.target.checked)}
                />
                <span>
                  Je confirme créer une dette de {formatPrice(deferred)} envers{' '}
                  {merchantName}.
                </span>
              </label>
            </>
          ) : null}
        </div>
      ) : null}

      {existingBalance > 0 ? (
        <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-bold">Ancienne dette</p>
              <p className="text-[11px] text-muted-foreground">
                Solde chez {merchantName} : {formatPrice(existingBalance)}
              </p>
            </div>
            <Switch
              label="Rembourser une partie de la dette"
              checked={repayEnabled}
              onCheckedChange={(v) => {
                onRepayEnabledChange(v)
                if (!v) {
                  onRepayAmountChange(0)
                  onRepayConfirmedChange(false)
                }
              }}
            />
          </div>
          {repayEnabled ? (
            <>
              <Field id="merchant-repay-amount" label="Montant affecté au remboursement">
                {(a11y) => (
                  <Input
                    {...a11y}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={existingBalance}
                    step={100}
                    value={repayAmount || ''}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      onRepayAmountChange(
                        Number.isFinite(n)
                          ? Math.min(existingBalance, Math.max(0, Math.floor(n)))
                          : 0,
                      )
                      onRepayConfirmedChange(false)
                    }}
                  />
                )}
              </Field>
              <label className="flex items-start gap-2 text-[12px]">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--brand)]"
                  checked={repayConfirmed}
                  onChange={(e) => onRepayConfirmedChange(e.target.checked)}
                />
                <span>
                  Je confirme rembourser {formatPrice(repayAmount)} sur ma dette
                  envers {merchantName} (séparé de la nouvelle commande).
                </span>
              </label>
            </>
          ) : null}
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Le remboursement est séparé de la nouvelle commande (pas de double vente).
          </p>
        </div>
      ) : null}
    </section>
  )
}
