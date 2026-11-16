import {
  Check,
  Gift,
  Info,
  Lock,
  Package,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AffiliateCommissionBreakdown } from '@/components/affiliate/AffiliateCommissionBreakdown'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/button'
import { MerchantCreditPaymentBlock } from '@/components/wallet/MerchantCreditPaymentBlock'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/hooks/use-profile'
import { useRewardsBalances } from '@/hooks/use-rewards'
import { useWalletBalances } from '@/hooks/use-wallet'
import {
  applyDemoPayment,
  REWARDS_POINTS_PER_FCFA,
  rewardsPointsToFcfa,
} from '@/lib/demo-balances-store'
import type { DemoPaymentOrderLine } from '@/lib/demo-payment-order'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { issuePaymentTicket } from '@/lib/issued-tickets-store'
import { planMerchantCreditSettlement } from '@/lib/merchant-credit-payment'
import { paymentRewardsEnabled, splitName } from '@/lib/payment-labels'
import {
  creditRewardsEarn,
  earnPointsForPayment,
} from '@/lib/rewards-earn-store'
import { cn } from '@/lib/utils'
import { addWalletPayment } from '@/lib/wallet-payments-store'
import { PIN_MAX, PIN_MIN } from '@/lib/wallet-schemas'
import { paths } from '@/routes/paths'
import type { WalletPaymentDomain, WalletPaymentPurpose } from '@/types/wallet'

/** Ligne de commande affichée dans le formulaire de paiement. */
export type PaymentOrderLine = DemoPaymentOrderLine

/** Résultat du paiement (Wallet + éventuel crédit commerçant). */
export interface WalletPaymentResult {
  paidAmount: number
  creditAmount: number
  remainingDue: number
  debtRepayment: number
  orderTotal: number
}

/** Bénéficiaire du paiement. */
export interface PaymentBeneficiary {
  name: string
  handle?: string
  business?: string
  avatarSrc?: string
  serviceId?: string
  verified?: boolean
}

interface WalletPaymentFormProps {
  purpose: WalletPaymentPurpose
  /** Module à l’origine du paiement (reporting Wallet / finances). */
  domain?: WalletPaymentDomain
  title: string
  detail?: string
  amount: number | null
  recipient?: string
  beneficiary?: PaymentBeneficiary
  orderLines?: readonly PaymentOrderLine[]
  quantity?: number
  unitPrice?: number
  discount?: number | null
  /** Frais de service. Omis = 2 % du sous-total. `0` = aucun frais. */
  fees?: number
  itemReference?: string
  itemImageSrc?: string
  /**
   * Afficher Rewards. Si omis : selon le `purpose`
   * (off pour Market Event, publicité, coins, positions).
   */
  enableRewards?: boolean
  editCartTo?: string
  payer?: { firstName: string; lastName: string }
  requiresAddress?: boolean
  requiresPhone?: boolean
  waitingLabel: string
  actionLabel?: string
  heading?: string
  /** @deprecated Le ticket s’ouvre automatiquement après paiement. */
  sentTitle?: string
  express?: boolean
  amountLocked?: boolean
  /**
   * Autorisation vendeur (service Pro). Si faux, le crédit n’apparaît pas
   * même si des lignes ont `allowMerchantCredit`.
   */
  enableMerchantCredit?: boolean
  /**
   * Redirection après paiement (sinon ticket).
   * Le ticket est toujours émis ; utile pour Canal Pro / AfriLearn.
   */
  successTo?: string
  /**
   * Appelé juste après le débit. Retourner `false` pour annuler la
   * redirection automatique (`successTo` / ticket).
   */
  onSent?: (
    requestId: string,
    ticketId: string,
    result?: WalletPaymentResult,
  ) => void | boolean
}

/** Frais de service : 2 % du sous-total. */
export const PAYMENT_SERVICE_FEE_RATE = 0.02

const PIN_PATTERN = new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`)

const AFRICONNECT: PaymentBeneficiary = {
  name: 'AfriConnect',
  business: 'Services AfriConnect',
  handle: 'africonnect',
  serviceId: 'africonnect',
  verified: true,
}

function money(value: number): string {
  return `${formatNumber(value)} F`
}

function Line({
  label,
  value,
  tone = 'default',
}: {
  label: ReactNode
  value: string
  tone?: 'default' | 'muted' | 'save' | 'total'
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3',
        tone === 'total' ? 'pt-1' : 'text-[13px]',
      )}
    >
      <span
        className={cn(
          'min-w-0',
          tone === 'total' && 'text-[15px] font-extrabold',
          tone === 'muted' && 'text-muted-foreground',
          tone === 'default' && 'text-muted-foreground',
          tone === 'save' && 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums',
          tone === 'total' && 'text-[1.45rem] font-extrabold text-[#4f46e5]',
          tone === 'save' && 'font-bold text-emerald-600',
          tone === 'default' && 'font-semibold text-foreground',
          tone === 'muted' && 'font-semibold text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Écran de paiement structuré comme la maquette :
 * en-tête → panier → Wallet → Rewards → récap → confirmer.
 */
export function WalletPaymentForm({
  purpose,
  domain,
  title,
  detail,
  amount,
  recipient,
  beneficiary = AFRICONNECT,
  orderLines,
  quantity,
  unitPrice,
  discount,
  fees,
  itemReference,
  itemImageSrc,
  enableRewards: enableRewardsProp,
  editCartTo,
  payer,
  waitingLabel,
  actionLabel = 'Confirmer le paiement',
  enableMerchantCredit = false,
  successTo,
  onSent,
}: WalletPaymentFormProps) {
  const profile = useProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const idPrefix = `pay-${useId()}`
  const { available } = useWalletBalances()
  const rewards = useRewardsBalances()
  const depositReturnTo = `${location.pathname}${location.search}`
  const enableRewards =
    enableRewardsProp ?? paymentRewardsEnabled(purpose)

  const names = splitName(profile.name)
  const [firstName, setFirstName] = useState(
    () => payer?.firstName ?? names.firstName,
  )
  const [lastName, setLastName] = useState(
    () => payer?.lastName ?? names.lastName,
  )
  const [payerId, setPayerId] = useState(() =>
    profile.handle.replace(/^@/, ''),
  )
  const [identityError, setIdentityError] = useState<string | undefined>()

  const lines = orderLines ?? []
  const subtotal =
    lines.length > 0
      ? lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      : amount

  const baseDiscount = discount && discount > 0 ? discount : 0
  const feeAmount =
    subtotal === null
      ? 0
      : fees !== undefined
        ? Math.max(0, Math.round(fees))
        : Math.max(0, Math.floor(subtotal * PAYMENT_SERVICE_FEE_RATE))

  const dueBeforeRewards =
    subtotal === null ? 0 : Math.max(0, subtotal - baseDiscount + feeAmount)

  const maxRewardsFcfa = dueBeforeRewards
  const maxRewardsPoints = useMemo(() => {
    return Math.min(
      rewards.available,
      maxRewardsFcfa * REWARDS_POINTS_PER_FCFA,
    )
  }, [rewards.available, maxRewardsFcfa])

  const [useWallet, setUseWallet] = useState(true)
  const [useRewards, setUseRewards] = useState(enableRewards)
  const [rewardsTouched, setRewardsTouched] = useState(false)
  const [rewardsPoints, setRewardsPoints] = useState(0)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | undefined>()
  const [creditEnabled, setCreditEnabled] = useState(false)
  const [creditDeferred, setCreditDeferred] = useState(0)
  const [creditConfirmed, setCreditConfirmed] = useState(false)
  const [repayEnabled, setRepayEnabled] = useState(false)
  const [repayAmount, setRepayAmount] = useState(0)
  const [repayConfirmed, setRepayConfirmed] = useState(false)

  const appliedPoints =
    enableRewards && useRewards
      ? rewardsTouched
        ? Math.min(Math.max(0, rewardsPoints), maxRewardsPoints)
        : maxRewardsPoints
      : 0
  const rewardsDiscount = rewardsPointsToFcfa(appliedPoints)
  const afterRewards = Math.max(0, dueBeforeRewards - rewardsDiscount)

  const creditPlan = planMerchantCreditSettlement({
    purposeIsPurchase: purpose === 'purchase',
    serviceAllowsCredit: enableMerchantCredit,
    lines,
    orderTotal: afterRewards,
    deferredRequested: creditEnabled ? creditDeferred : 0,
    creditConfirmed,
    creditEnabled,
    repayEnabled: repayEnabled && repayConfirmed,
    repayRequested: repayEnabled && repayConfirmed ? repayAmount : 0,
    clientHandle: payerId || profile.handle,
    serviceId: beneficiary.serviceId ?? '',
  })

  const showMerchantCredit =
    purpose === 'purchase' &&
    enableMerchantCredit &&
    (creditPlan.eligible > 0 || creditPlan.existingBalance > 0)
  const eligibleCredit = creditPlan.eligible
  const existingBalance = creditPlan.existingBalance
  const deferredCredit = creditPlan.deferredCredit
  const debtRepayNow = creditPlan.debtRepayment
  const orderDueNow = creditPlan.payNow
  const totalWalletNeed = orderDueNow + debtRepayNow
  const walletUsed = useWallet ? Math.min(available, totalWalletNeed) : 0
  const resteAPayer = Math.max(0, totalWalletNeed - walletUsed)
  const payable = walletUsed
  const paidTowardOrder = Math.min(walletUsed, orderDueNow)
  const paidTowardDebt = Math.max(0, walletUsed - paidTowardOrder)

  const shortfall = !useWallet
    ? totalWalletNeed
    : Math.max(0, totalWalletNeed - available)

  const canConfirm =
    subtotal !== null &&
    resteAPayer === 0 &&
    creditPlan.errors.length === 0 &&
    (!(creditEnabled && creditDeferred > 0) || creditConfirmed) &&
    (!(repayEnabled && repayAmount > 0) || repayConfirmed) &&
    (totalWalletNeed === 0 || (useWallet && walletUsed >= totalWalletNeed))

  const articleCount =
    lines.length > 0
      ? lines.reduce((n, line) => n + line.quantity, 0)
      : (quantity ?? 1)

  const beneficiaryHandle = beneficiary.handle ?? 'africonnect'
  const beneficiaryName = beneficiary.business ?? beneficiary.name
  const firstLine = lines[0]
  const fcfaPerPoint = (1 / REWARDS_POINTS_PER_FCFA).toFixed(2).replace('.', ',')

  function pay() {
    if (subtotal === null || !canConfirm) return
    if (lastName.trim().length < 2 || firstName.trim().length < 2) {
      setIdentityError('Indiquez nom et prénom (2 caractères min.)')
      return
    }
    const idClean = payerId.trim().replace(/^@/, '')
    if (idClean.length < 2) {
      setIdentityError('Indiquez votre ID AfriConnect')
      return
    }
    setIdentityError(undefined)
    if (!PIN_PATTERN.test(pin)) {
      setPinError(`PIN : ${PIN_MIN} à ${PIN_MAX} chiffres`)
      return
    }
    setPinError(undefined)
    if (payable > 0 && !applyDemoPayment(payable, appliedPoints)) return
    if (payable === 0 && appliedPoints > 0 && !applyDemoPayment(0, appliedPoints))
      return

    // Horodatage au moment de la confirmation (handler), pas au rendu.
    // eslint-disable-next-line react-hooks/purity -- Date.now() dans le handler de paiement
    const now = Date.now()
    const creditAmount = deferredCredit
    const orderPaid = paidTowardOrder
    const repayPaid = paidTowardDebt
    const rewardNote =
      appliedPoints > 0
        ? ` · Rewards −${appliedPoints} pts (−${formatPrice(rewardsDiscount)})`
        : ''
    const creditNote =
      creditAmount > 0 ? ` · Crédit commerçant ${formatPrice(creditAmount)}` : ''
    const repayNote =
      repayPaid > 0 ? ` · Remb. dette ${formatPrice(repayPaid)}` : ''
    const request = addWalletPayment(
      {
        purpose,
        ...(domain ? { domain } : {}),
        title,
        amount: payable,
        payerName: `${firstName.trim()} ${lastName.trim()}`,
        payerHandle: idClean,
        ...(profile.phone ? { payerPhone: profile.phone } : {}),
        beneficiaryHandle,
        beneficiaryName,
        ...(beneficiary.business
          ? { beneficiaryBusiness: beneficiary.business }
          : {}),
        ...(beneficiary.serviceId
          ? { beneficiaryServiceId: beneficiary.serviceId }
          : {}),
        detail: `${detail ?? title}${rewardNote}${creditNote}${repayNote}`,
        ...(recipient ? { recipient } : {}),
        ...(quantity !== undefined
          ? { quantity }
          : firstLine
            ? { quantity: firstLine.quantity }
            : {}),
        ...(unitPrice !== undefined
          ? { unitPrice }
          : firstLine
            ? { unitPrice: firstLine.unitPrice }
            : {}),
      },
      now,
    )

    const txRef =
      request.provisionalReference ??
      `AC-${request.id.replace(/\D/g, '').slice(0, 9)}`

    // Dette / remboursement enregistrés par le parcours métier (Checkout)
    // via settleMerchantCreditAfterPayment — pas ici (évite double écriture).

    const ticket = issuePaymentTicket(
      {
        serviceId: beneficiary.serviceId ?? beneficiaryHandle,
        proRef: beneficiaryHandle,
        providerName: beneficiaryName,
        ...(beneficiary.avatarSrc
          ? { providerLogo: beneficiary.avatarSrc }
          : {}),
        clientName: `${firstName.trim()} ${lastName.trim()}`,
        ...(profile.phone ? { clientPhone: profile.phone } : {}),
        itemLabel: title,
        ...(itemReference
          ? { itemReference }
          : firstLine?.reference
            ? { itemReference: firstLine.reference }
            : {}),
        ...(quantity !== undefined
          ? { quantity }
          : firstLine
            ? { quantity: firstLine.quantity }
            : {}),
        ...(itemImageSrc
          ? { itemImageSrc }
          : firstLine?.imageSrc
            ? { itemImageSrc: firstLine.imageSrc }
            : {}),
        amount: orderPaid,
        originalAmount: subtotal + feeAmount,
        ...(appliedPoints > 0
          ? {
              rewardsPointsUsed: appliedPoints,
              rewardsDiscountFcfa: rewardsDiscount,
            }
          : {}),
        ...(creditAmount > 0
          ? {
              creditAmount,
              remainingDue: creditAmount,
              paymentStatusLabel: 'Partiel · crédit commerçant',
            }
          : { paymentStatusLabel: 'Payé' }),
        transactionRef: txRef,
      },
      now,
    )

    const earned = earnPointsForPayment(Math.max(orderPaid, afterRewards))
    creditRewardsEarn(
      {
        key: `pay:${ticket.id}`,
        points: earned,
        title: 'Achat confirmé',
        detail: `${title} · +${earned} pts`,
      },
      now,
    )

    const result: WalletPaymentResult = {
      paidAmount: orderPaid,
      creditAmount,
      remainingDue: creditAmount,
      debtRepayment: repayPaid,
      orderTotal: afterRewards,
    }

    setPin('')
    const cont = onSent?.(request.id, ticket.id, result)
    if (cont === false) return
    if (successTo) {
      const sep = successTo.includes('?') ? '&' : '?'
      navigate(
        `${successTo}${sep}paye=1&ticket=${encodeURIComponent(ticket.id)}`,
        { replace: true },
      )
    } else {
      navigate(`${paths.ticket(ticket.id)}?telecharger=1`, { replace: true })
    }
  }

  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault()
          if (event.target.type === 'password') pay()
        }
      }}
    >
      {/* Une seule carte : toutes les sections sur le même écran */}
      <div className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_2px_12px_rgb(0_0_0_/0.08)] ring-1 ring-black/[0.05]">
        {/* En-tête */}
        <header className="flex items-center gap-2 border-b border-black/[0.06] px-3.5 py-2.5">
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[1.05rem] font-extrabold tracking-tight text-[#4f46e5]">
              AfriConnect
            </p>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Paiement sécurisé
            </p>
          </div>
          <ShieldCheck className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
        </header>

        <div className="divide-y divide-black/[0.06]">
          {/* Panier */}
          <section aria-label="Mon panier" className="space-y-2 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex min-w-0 items-center gap-1.5 text-[13px] font-extrabold">
                <ShoppingCart className="size-3.5 shrink-0 text-[#4f46e5]" aria-hidden="true" />
                <span className="truncate">
                  {lines.length > 0
                    ? `Mon panier (${articleCount})`
                    : 'Détail'}
                </span>
              </h2>
              {editCartTo ? (
                <Link to={editCartTo} className="shrink-0 text-[11px] font-bold text-[#4f46e5]">
                  Modifier ›
                </Link>
              ) : null}
            </div>

            {lines.length > 0 ? (
              <ul className="space-y-1.5">
                {lines.map((line) => (
                  <li key={line.id} className="flex min-w-0 items-center gap-2">
                    <div className="size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {line.imageSrc ? (
                        <img
                          src={line.imageSrc}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-muted-foreground">
                          <Package className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold">{line.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        × {line.quantity}
                        {line.allowMerchantCredit ? ' · crédit autorisé' : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-extrabold tabular-nums">
                      {money(line.unitPrice * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-0.5">
                <p className="truncate text-[12px] font-bold">{title}</p>
                <p className="text-[12px] font-extrabold tabular-nums">
                  {subtotal === null ? '—' : money(subtotal)}
                </p>
              </div>
            )}

            <div className="space-y-0.5 pt-1">
              <Line
                label="Sous-total"
                value={subtotal === null ? '—' : money(subtotal)}
              />
              <Line
                label={
                  <span className="inline-flex items-center gap-1">
                    Frais de service
                    <Info className="size-3 text-muted-foreground" aria-hidden="true" />
                  </span>
                }
                value={money(feeAmount)}
              />
            </div>
          </section>

          {/* Identité acheteur */}
          <section aria-label="Identité" className="space-y-2 px-3.5 py-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Field id={`${idPrefix}-last`} label="Nom">
                {(a11y) => (
                  <Input
                    {...a11y}
                    value={lastName}
                    maxLength={40}
                    autoComplete="family-name"
                    className="h-9 text-[13px]"
                    onChange={(event) => {
                      setLastName(event.target.value)
                      setIdentityError(undefined)
                    }}
                  />
                )}
              </Field>
              <Field id={`${idPrefix}-first`} label="Prénom">
                {(a11y) => (
                  <Input
                    {...a11y}
                    value={firstName}
                    maxLength={40}
                    autoComplete="given-name"
                    className="h-9 text-[13px]"
                    onChange={(event) => {
                      setFirstName(event.target.value)
                      setIdentityError(undefined)
                    }}
                  />
                )}
              </Field>
            </div>
            <Field id={`${idPrefix}-id`} label="ID AfriConnect" hint="Sans le @">
              {(a11y) => (
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[12px] font-bold text-muted-foreground"
                  >
                    @
                  </span>
                  <Input
                    {...a11y}
                    value={payerId}
                    maxLength={40}
                    autoComplete="username"
                    className="h-9 pl-7 text-[13px]"
                    placeholder="votre.id"
                    onChange={(event) => {
                      setPayerId(event.target.value.replace(/^@/, ''))
                      setIdentityError(undefined)
                    }}
                  />
                </div>
              )}
            </Field>
            {identityError ? (
              <p role="alert" className="text-[11px] font-medium text-danger">
                {identityError}
              </p>
            ) : null}
          </section>

          {/* Wallet + Rewards côte à côte / empilés compacts */}
          <section aria-label="Wallet et Rewards" className="space-y-2 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#4f46e5] text-white">
                <Wallet className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  Wallet
                </p>
                <p className="text-[15px] font-extrabold tabular-nums">{money(available)}</p>
              </div>
              <Switch
                id={`${idPrefix}-wallet`}
                label="Utiliser mon Wallet"
                checked={useWallet}
                checkedTrackClassName="!bg-emerald-500"
                onCheckedChange={setUseWallet}
              />
            </div>

            {enableRewards ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-600">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      Rewards
                    </p>
                    <p className="text-[15px] font-extrabold tabular-nums">
                      {formatCount(rewards.available)} pts
                      <span className="ml-1 text-[10px] font-semibold text-muted-foreground">
                        (= {money(rewardsPointsToFcfa(rewards.available))})
                      </span>
                    </p>
                  </div>
                  <Switch
                    id={`${idPrefix}-rewards`}
                    label="Utiliser Rewards"
                    checked={useRewards}
                    checkedTrackClassName="!bg-emerald-500"
                    onCheckedChange={(on) => {
                      setUseRewards(on)
                      setRewardsTouched(true)
                      setRewardsPoints(on ? maxRewardsPoints : 0)
                    }}
                  />
                </div>

                {useRewards ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <label
                        htmlFor={`${idPrefix}-rewards-range`}
                        className="text-[10px] font-bold text-muted-foreground"
                      >
                        Points (1 pt = {fcfaPerPoint} F)
                      </label>
                      <span className="text-[12px] font-extrabold tabular-nums text-[#4f46e5]">
                        {formatCount(appliedPoints)}
                      </span>
                    </div>
                    <input
                      id={`${idPrefix}-rewards-range`}
                      type="range"
                      min={0}
                      max={Math.max(0, maxRewardsPoints)}
                      step={1}
                      value={appliedPoints}
                      disabled={maxRewardsPoints === 0}
                      onChange={(event) => {
                        const next = Number(event.target.value)
                        setRewardsTouched(true)
                        setRewardsPoints(
                          Number.isFinite(next)
                            ? Math.min(Math.max(0, Math.floor(next)), maxRewardsPoints)
                            : 0,
                        )
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#4f46e5]/20 accent-[#4f46e5] disabled:opacity-40"
                    />
                    {rewardsDiscount > 0 ? (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4f46e5]">
                        <Gift className="size-3.5 shrink-0" aria-hidden="true" />
                        − {money(rewardsDiscount)} grâce aux points
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          {showMerchantCredit ? (
            <MerchantCreditPaymentBlock
              merchantName={beneficiaryName}
              eligibleAmount={eligibleCredit}
              deferred={creditDeferred}
              onDeferredChange={setCreditDeferred}
              enabled={creditEnabled}
              onEnabledChange={setCreditEnabled}
              confirmed={creditConfirmed}
              onConfirmedChange={setCreditConfirmed}
              existingBalance={existingBalance}
              repayAmount={repayAmount}
              onRepayAmountChange={setRepayAmount}
              repayEnabled={repayEnabled}
              onRepayEnabledChange={setRepayEnabled}
              repayConfirmed={repayConfirmed}
              onRepayConfirmedChange={setRepayConfirmed}
            />
          ) : null}

          {(purpose === 'purchase' || purpose === 'subscription') &&
          beneficiary.serviceId &&
          subtotal !== null &&
          subtotal > 0 ? (
            <div className="px-3.5 pb-1">
              <AffiliateCommissionBreakdown
                serviceId={beneficiary.serviceId}
                amount={subtotal}
              />
            </div>
          ) : null}

          {/* Récapitulatif */}
          <section aria-label="Récapitulatif" className="space-y-1 px-3.5 py-2.5">
            <h2 className="text-[12px] font-extrabold">Récapitulatif</h2>
            <Line
              label="Sous-total"
              value={subtotal === null ? '—' : money(subtotal)}
            />
            <Line label="Frais de service" value={money(feeAmount)} />
            {rewardsDiscount > 0 ? (
              <Line
                label="Réduction Rewards"
                value={`− ${money(rewardsDiscount)}`}
                tone="save"
              />
            ) : null}
            {paidTowardOrder > 0 ? (
              <Line
                label="Payé maintenant (Wallet)"
                value={`− ${money(paidTowardOrder)}`}
                tone="save"
              />
            ) : null}
            {deferredCredit > 0 ? (
              <Line label="Reporté en crédit" value={money(deferredCredit)} />
            ) : null}
            {debtRepayNow > 0 ? (
              <Line
                label="Remboursement dette"
                value={`− ${money(debtRepayNow)}`}
                tone="save"
              />
            ) : null}
            {deferredCredit > 0 ? (
              <Line label="Nouvelle dette" value={money(deferredCredit)} />
            ) : null}
            <div className="pt-1">
              <Line
                label={
                  <span className="inline-flex items-center gap-1">
                    Reste à payer maintenant
                    {resteAPayer === 0 ? (
                      <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                    ) : null}
                  </span>
                }
                value={money(resteAPayer)}
                tone="total"
              />
            </div>
          </section>

          {shortfall > 0 ? (
            <div
              role="alert"
              className="space-y-1.5 bg-amber-50 px-3.5 py-2.5"
            >
              <p className="flex items-start gap-2 text-[12px]">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                <span>
                  <strong>
                    {!useWallet ? 'Activez le Wallet.' : 'Solde insuffisant.'}
                  </strong>{' '}
                  {useWallet
                    ? `Il manque ${money(shortfall)}.`
                    : `Dû maintenant : ${money(totalWalletNeed)}.`}
                </span>
              </p>
              <Link
                to={`${paths.walletDeposit()}?retour=${encodeURIComponent(depositReturnTo)}`}
                className="text-[12px] font-bold text-[#4f46e5] underline underline-offset-2"
              >
                Approvisionner
              </Link>
            </div>
          ) : null}

          {/* PIN + Confirmer */}
          <section className="space-y-2 px-3.5 py-2.5 pb-3">
            <Field id={`${idPrefix}-pin`} label="PIN Wallet" error={pinError}>
              {(control) => (
                <Input
                  {...control}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={PIN_MAX}
                  placeholder="••••"
                  value={pin}
                  className="h-10 rounded-xl tracking-[0.35em]"
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, ''))
                    setPinError(undefined)
                  }}
                />
              )}
            </Field>

            <Button
              type="button"
              size="lg"
              className="h-11 w-full gap-2 rounded-xl bg-[#4f46e5] text-[14px] font-extrabold hover:bg-[#4338ca]"
              disabled={!canConfirm || subtotal === null}
              onClick={pay}
            >
              <Lock className="size-4" aria-hidden="true" />
              {subtotal === null
                ? waitingLabel
                : resteAPayer > 0
                  ? `Il reste ${money(resteAPayer)}`
                  : actionLabel}
            </Button>

            <p className="flex items-center justify-center gap-1 text-center text-[10px] font-semibold text-emerald-600">
              <Check className="size-3 shrink-0" aria-hidden="true" />
              Paiement 100 % sécurisé · données protégées
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
