import { ReceiptText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { DepositCountdown } from '@/components/wallet/DepositCountdown'
import { InfoList, type InfoRow } from '@/components/wallet/InfoList'
import { ProgressTimeline } from '@/components/wallet/ProgressTimeline'
import { StatusCard } from '@/components/wallet/StatusCard'
import { formatPrice } from '@/lib/format'
import { findDeposit } from '@/lib/placeholder-wallet'
import { formatDateTime } from '@/lib/pro-labels'
import { DEPOSIT_STATUS, DEPOSIT_STEPS } from '@/lib/wallet-labels'
import { paths } from '@/routes/paths'

/** Suivi d'une demande de dépôt : état, étapes, instructions tant qu'elle est ouverte. */
export function DepositDetailPage() {
  const { depositId } = useParams()
  const deposit = findDeposit(depositId)

  if (!deposit) {
    return (
      <>
        <PageHeader
          title="Dépôt"
          leading={<BackLink to={paths.wallet} label="Wallet" history />}
        />
        <EmptyState
          icon={ReceiptText}
          title="Dépôt introuvable"
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

  const meta = DEPOSIT_STATUS[deposit.status]
  const waiting = deposit.status === 'WAITING_PAYMENT'
  const { declaration } = deposit

  const summary: InfoRow[] = [
    { term: 'Référence', value: deposit.reference },
    { term: 'Moyen', value: deposit.operator },
    { term: 'Montant', value: formatPrice(deposit.amount) },
    { term: 'Demande créée', value: formatDateTime(deposit.createdAt) },
    { term: 'Valable jusqu’à', value: formatDateTime(deposit.expiresAt) },
    ...(deposit.creditedAt
      ? [{ term: 'Crédité le', value: formatDateTime(deposit.creditedAt) }]
      : []),
  ]

  const declared: InfoRow[] = declaration
    ? [
        { term: 'Montant transféré', value: formatPrice(declaration.amount) },
        { term: 'Numéro expéditeur', value: declaration.senderNumber },
        { term: 'Compte marchand', value: declaration.merchantNumber },
        { term: 'Date du transfert', value: formatDateTime(declaration.transferredAt) },
        {
          term: 'Identifiant de transaction',
          value: declaration.transactionId ?? 'Non renseigné',
        },
      ]
    : []

  return (
    <>
      <PageHeader
        title={`Dépôt ${deposit.reference}`}
        leading={<BackLink to={paths.wallet} label="Wallet" history />}
      />

      <div className="space-y-5 py-4">
        <StatusCard meta={meta} />

        {waiting ? (
          <div className="mx-4 space-y-3">
            <DepositCountdown expiresAt={deposit.expiresAt} />
            <div className="space-y-2 rounded-2xl border bg-card p-4">
              <p className="text-body font-bold">Transfert à effectuer</p>
              <p className="text-body">
                Envoyez {formatPrice(deposit.amount)} au compte marchand{' '}
                <strong>{deposit.merchantNumber}</strong>, ou composez le code ci-dessous.
              </p>
              <p className="rounded-xl bg-muted p-3 font-mono text-body font-bold break-all select-all">
                {deposit.ussd}
              </p>
              <p className="text-caption text-muted-foreground">
                Code d’exemple, à confirmer avec le compte marchand Orange Money.
              </p>
            </div>
          </div>
        ) : null}

        <ProgressTimeline
          label="Étapes du dépôt"
          steps={DEPOSIT_STEPS}
          reached={meta.reached}
          outcome={meta.outcome}
        />
        <InfoList label="Récapitulatif du dépôt" rows={summary} />
        {declared.length > 0 ? (
          <section className="space-y-2">
            <h2 className="px-4 text-title font-bold">Votre déclaration</h2>
            <InfoList label="Informations déclarées" rows={declared} />
            <p className="px-4 text-caption text-muted-foreground">
              Ces informations aident au rapprochement mais ne remplacent pas la
              vérification de la transaction reçue sur le compte marchand.
            </p>
          </section>
        ) : null}
      </div>
    </>
  )
}
