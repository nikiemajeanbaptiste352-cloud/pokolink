/**
 * Service central crédit commerçant (démo frontend).
 * Vérifie les autorisations individuelles avant toute dette / remboursement.
 * À remplacer côté serveur par des opérations atomiques anti-double validation.
 */
import {
  clampDeferredCredit,
  creditEligibleAmount,
} from '@/lib/merchant-credit-calc'
import {
  getOpenDebtForShop,
  recordMerchantRepayment,
  recordMerchantSaleCredit,
} from '@/lib/merchant-credits-store'
import type { DemoPaymentOrderLine } from '@/lib/demo-payment-order'
import type { MerchantDebt } from '@/types/merchant-credit'
import type { CatalogItem, Service } from '@/types/service'

/** Autorisation effective d’une ligne = établissement ET article. */
export function isLineCreditAuthorized(
  serviceAllows: boolean,
  itemAllows: boolean | undefined,
): boolean {
  return serviceAllows === true && itemAllows === true
}

export function resolveOrderCreditEligibility(input: {
  purposeIsPurchase: boolean
  serviceAllowsCredit: boolean
  lines: readonly DemoPaymentOrderLine[]
  orderTotal: number
}): { eligible: number; serviceEnabled: boolean } {
  const serviceEnabled =
    input.purposeIsPurchase && input.serviceAllowsCredit === true
  if (!serviceEnabled) return { eligible: 0, serviceEnabled: false }
  return {
    serviceEnabled: true,
    eligible: creditEligibleAmount(input.lines, input.orderTotal, false),
  }
}

export interface MerchantCreditSettlementPlan {
  orderTotal: number
  deferredCredit: number
  payNow: number
  debtRepayment: number
  existingBalance: number
  eligible: number
  errors: string[]
}

/** Calcule et valide la répartition avant confirmation PIN. */
export function planMerchantCreditSettlement(input: {
  purposeIsPurchase: boolean
  serviceAllowsCredit: boolean
  lines: readonly DemoPaymentOrderLine[]
  orderTotal: number
  deferredRequested: number
  creditConfirmed: boolean
  creditEnabled: boolean
  repayEnabled: boolean
  repayRequested: number
  clientHandle: string
  serviceId: string
}): MerchantCreditSettlementPlan {
  const { eligible, serviceEnabled } = resolveOrderCreditEligibility({
    purposeIsPurchase: input.purposeIsPurchase,
    serviceAllowsCredit: input.serviceAllowsCredit,
    lines: input.lines,
    orderTotal: input.orderTotal,
  })

  const errors: string[] = []
  let deferredCredit = 0

  if (input.creditEnabled && input.deferredRequested > 0) {
    if (!serviceEnabled || eligible <= 0) {
      errors.push('Crédit non autorisé pour ces articles.')
    } else if (!input.creditConfirmed) {
      errors.push('Confirmez la création de la dette.')
    } else {
      deferredCredit = clampDeferredCredit(
        input.deferredRequested,
        eligible,
        input.orderTotal,
      )
      if (deferredCredit <= 0) {
        errors.push('Montant de crédit invalide.')
      }
    }
  }

  const existing = getOpenDebtForShop(input.clientHandle, input.serviceId)
  const existingBalance = existing?.balance ?? 0
  let debtRepayment = 0
  if (input.repayEnabled && input.repayRequested > 0) {
    if (existingBalance <= 0) {
      errors.push('Aucune dette ouverte chez ce commerçant.')
    } else {
      debtRepayment = Math.min(
        existingBalance,
        Math.max(0, Math.floor(input.repayRequested)),
      )
    }
  }

  const payNow = Math.max(0, input.orderTotal - deferredCredit)
  return {
    orderTotal: input.orderTotal,
    deferredCredit,
    payNow,
    debtRepayment,
    existingBalance,
    eligible,
    errors,
  }
}

export interface SettleMerchantCreditInput {
  serviceId: string
  sellerName: string
  sellerLogo?: string
  proRef: string
  clientHandle: string
  clientName: string
  creditAmount: number
  debtRepayment: number
  saleReference: string
  repaymentReference: string
  purchaseId?: string
  ticketId?: string
}

/**
 * Enregistre dette de vente et/ou remboursement (séparés).
 * Pas de double commission : le remboursement n’est pas une vente.
 */
export function settleMerchantCreditAfterPayment(
  input: SettleMerchantCreditInput,
  now = Date.now(),
): { debt?: MerchantDebt; repayment?: MerchantDebt } {
  let debt: MerchantDebt | undefined
  let repayment: MerchantDebt | undefined

  if (input.creditAmount > 0) {
    debt = recordMerchantSaleCredit(
      {
        serviceId: input.serviceId,
        sellerName: input.sellerName,
        ...(input.sellerLogo ? { sellerLogo: input.sellerLogo } : {}),
        proRef: input.proRef,
        clientHandle: input.clientHandle,
        clientName: input.clientName,
        creditAmount: input.creditAmount,
        reference: input.saleReference,
        ...(input.purchaseId ? { purchaseId: input.purchaseId } : {}),
        ...(input.ticketId ? { ticketId: input.ticketId } : {}),
      },
      now,
    )
  }

  if (input.debtRepayment > 0) {
    repayment = recordMerchantRepayment(
      {
        serviceId: input.serviceId,
        clientHandle: input.clientHandle,
        amount: input.debtRepayment,
        reference: input.repaymentReference,
        ...(input.ticketId ? { ticketId: input.ticketId } : {}),
        note: 'Remboursement lors d’un nouvel achat',
      },
      now,
    )
  }

  return { ...(debt ? { debt } : {}), ...(repayment ? { repayment } : {}) }
}

/** Flags crédit pour les lignes panier / checkout. */
export function creditFlagsForCatalogLines(
  service: Pick<Service, 'allowMerchantCredit'>,
  lines: readonly { item: CatalogItem; quantity: number }[],
  sellerName: string,
): DemoPaymentOrderLine[] {
  const serviceOk = service.allowMerchantCredit === true
  return lines.map(({ item, quantity }) => ({
    id: item.id,
    name: item.name,
    sellerName,
    quantity,
    unitPrice: item.price,
    allowMerchantCredit: isLineCreditAuthorized(
      serviceOk,
      item.allowMerchantCredit,
    ),
    ...(item.image ? { imageSrc: item.image } : {}),
  }))
}
