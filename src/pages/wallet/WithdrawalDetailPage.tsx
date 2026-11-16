import { Landmark, ReceiptText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { InfoList, type InfoRow } from '@/components/wallet/InfoList'
import { ProgressTimeline } from '@/components/wallet/ProgressTimeline'
import { StatusCard } from '@/components/wallet/StatusCard'
import { formatPrice } from '@/lib/format'
import { findWithdrawal, getMethodLabel } from '@/lib/placeholder-wallet'
import { formatDateTime } from '@/lib/pro-labels'
import {
  FUNDS_TEXT,
  WITHDRAWAL_FUNDS,
  WITHDRAWAL_STATUS,
  WITHDRAWAL_STEPS,
} from '@/lib/wallet-labels'
import { paths } from '@/routes/paths'

/** Suivi d'une demande de retrait : état, sort des fonds, étapes et récapitulatif. */
export function WithdrawalDetailPage() {
  const { withdrawalId } = useParams()
  const withdrawal = findWithdrawal(withdrawalId)

  if (!withdrawal) {
    return (
      <>
        <PageHeader
          title="Retrait"
          leading={<BackLink to={paths.wallet} label="Wallet" history />}
        />
        <EmptyState
          icon={ReceiptText}
          title="Retrait introuvable"
          description="Cette demande n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.wallet} className={buttonVariants()}>
              Retour au Wallet
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const meta = WITHDRAWAL_STATUS[withdrawal.status]
  const funds = WITHDRAWAL_FUNDS[withdrawal.status]
  const { payout } = withdrawal

  const summary: InfoRow[] = [
    { term: 'Référence', value: withdrawal.reference },
    { term: 'Moyen', value: getMethodLabel(withdrawal.methodId) },
    { term: 'Montant demandé', value: formatPrice(withdrawal.amount) },
    {
      term: 'Frais',
      value: withdrawal.fee === null ? 'À définir' : formatPrice(withdrawal.fee),
    },
    {
      term: 'Montant net à transférer',
      value:
        withdrawal.netAmount === null ? 'À définir' : formatPrice(withdrawal.netAmount),
    },
    { term: 'Bénéficiaire', value: withdrawal.beneficiaryName || 'Non renseigné' },
    { term: 'Numéro', value: withdrawal.beneficiaryNumber },
    { term: 'Demande créée', value: formatDateTime(withdrawal.createdAt) },
    { term: 'Dernière mise à jour', value: formatDateTime(withdrawal.updatedAt) },
  ]

  const transfer: InfoRow[] = payout
    ? [
        { term: 'Référence du transfert', value: payout.externalId },
        { term: 'Montant transféré', value: formatPrice(payout.amountSent) },
        { term: 'Date du transfert', value: formatDateTime(payout.transferredAt) },
      ]
    : []

  return (
    <>
      <PageHeader
        title={`Retrait ${withdrawal.reference}`}
        leading={<BackLink to={paths.wallet} label="Wallet" history />}
      />

      <div className="space-y-5 py-4">
        <StatusCard meta={meta} />

        <p className="mx-4 flex items-start gap-3 rounded-2xl border bg-card p-4 text-body">
          <Landmark className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {FUNDS_TEXT[funds]}
        </p>

        <ProgressTimeline
          label="Étapes du retrait"
          steps={WITHDRAWAL_STEPS}
          reached={meta.reached}
          outcome={meta.outcome}
        />
        <InfoList label="Récapitulatif du retrait" rows={summary} />
        {transfer.length > 0 ? (
          <section className="space-y-2">
            <h2 className="px-4 text-title font-bold">Transfert effectué</h2>
            <InfoList label="Détails du transfert" rows={transfer} />
          </section>
        ) : null}
      </div>
    </>
  )
}
