import { ReceiptText, Ticket } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { formatSignedPrice } from '@/components/market/market-utils'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { InfoList, type InfoRow } from '@/components/wallet/InfoList'
import { formatPrice } from '@/lib/format'
import { TRANSACTION_KIND_LABEL } from '@/lib/payment-labels'
import { findTransaction, findTransactionByReference } from '@/lib/placeholder-wallet'
import { formatDateTime } from '@/lib/pro-labels'
import { paths } from '@/routes/paths'

/**
 * Détail d'une ligne du journal Wallet : paiement, crédit reçu, commission, remboursement ou
 * annulation. Une ligne n'est ni modifiable ni supprimable : une erreur se corrige par une
 * annulation (contrepassation) qui garde toute la traçabilité.
 */
export function WalletOperationPage() {
  const { operationId } = useParams()
  const transaction = findTransaction(operationId)

  if (!transaction) {
    return (
      <>
        <PageHeader
          title="Opération"
          leading={<BackLink to={paths.wallet} label="Wallet" history />}
        />
        <EmptyState
          icon={ReceiptText}
          title="Opération introuvable"
          description="Cette opération n’existe pas ou n’est pas associée à votre compte."
          action={
            <Link to={paths.wallet} className={buttonVariants()}>
              Mon Wallet
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const origin = findTransactionByReference(transaction.relatedReference)
  const isCommission = transaction.kind === 'commission'
  const counterpartLink = transaction.counterpart?.handle
    ? paths.establishment(transaction.counterpart.handle)
    : undefined

  const rows: InfoRow[] = [
    { term: 'Nature', value: TRANSACTION_KIND_LABEL[transaction.kind] },
    ...(transaction.reference
      ? [{ term: 'Référence', value: transaction.reference }]
      : []),
    { term: 'Date', value: formatDateTime(transaction.at) },
    { term: 'Statut', value: 'Confirmée par le serveur' },
    ...(transaction.counterpart
      ? [
          {
            term: transaction.kind === 'credit' ? 'Payeur' : 'Contrepartie',
            value: counterpartLink ? (
              <Link to={counterpartLink} className="underline underline-offset-2">
                {transaction.counterpart.name}
              </Link>
            ) : (
              transaction.counterpart.name
            ),
          },
        ]
      : []),
    ...(transaction.relatedReference
      ? [
          {
            term: 'Opération d’origine',
            value: origin ? (
              <Link
                to={paths.walletOperation(origin.id)}
                className="underline underline-offset-2"
              >
                {transaction.relatedReference}
              </Link>
            ) : (
              transaction.relatedReference
            ),
          },
        ]
      : []),
  ]

  const journal: InfoRow[] =
    transaction.gross !== undefined && transaction.commission !== undefined
      ? [
          { term: 'Montant payé par le client', value: formatPrice(transaction.gross) },
          {
            term: 'Commission AfriConnect',
            value: formatPrice(transaction.commission),
          },
          // Le crédit net est celui du serveur (montant de la ligne), jamais recalculé ici.
          ...(transaction.kind === 'credit'
            ? [{ term: 'Crédit net du bénéficiaire', value: formatPrice(transaction.amount) }]
            : []),
        ]
      : []

  return (
    <>
      <PageHeader
        title="Opération"
        leading={<BackLink to={paths.wallet} label="Wallet" history />}
      />
      <div className="space-y-5 py-4 pb-8">

        <section aria-label="Montant" className="space-y-1 px-4 text-center">
          <p className="text-body text-muted-foreground">{transaction.title}</p>
          <p className="text-headline font-extrabold tabular-nums">
            {isCommission
              ? formatPrice(transaction.amount)
              : formatSignedPrice(transaction.amount)}
          </p>
          {transaction.detail ? (
            <p className="text-caption text-muted-foreground">{transaction.detail}</p>
          ) : null}
        </section>

        <InfoList label="Détails de l’opération" rows={rows} />

        {journal.length > 0 ? (
          <section className="space-y-2">
            <h2 className="px-4 text-title font-bold">Mouvements financiers</h2>
            <InfoList label="Mouvements financiers" rows={journal} />
            <p className="px-4 text-caption text-muted-foreground">
              Calculés par le serveur selon les règles de commission de la catégorie : le
              frontend n’affiche que le résultat.
            </p>
          </section>
        ) : null}

        {transaction.document ? (
          <div className="px-4">
            <Link
              to={paths.receipt('operation', transaction.id)}
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              {transaction.document === 'ticket' ? (
                <Ticket aria-hidden="true" />
              ) : (
                <ReceiptText aria-hidden="true" />
              )}
              {transaction.document === 'ticket'
                ? 'Voir le ticket'
                : 'Voir le justificatif'}
            </Link>
          </div>
        ) : null}

        <p className="px-4 text-caption text-muted-foreground">
          Cette ligne ne peut être ni modifiée ni supprimée. Une erreur se corrige par une
          annulation ou une contrepassation, qui apparaît à son tour dans l’historique.
        </p>
      </div>
    </>
  )
}
