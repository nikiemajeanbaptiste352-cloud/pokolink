import { Download, ReceiptText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { ReceiptCard } from '@/components/receipts/ReceiptCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePurchases } from '@/hooks/use-purchases'
import { receiptForPurchase, receiptForTransaction, type ReceiptData } from '@/lib/receipts'
import { paths } from '@/routes/paths'

/** « Télécharger » : ouvre l'impression, qui permet d'enregistrer le justificatif en PDF. */
function download(receipt: ReceiptData) {
  const previous = document.title
  document.title = `${receipt.kind === 'ticket' ? 'Ticket' : 'Justificatif'}-${receipt.transactionNumber}`
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}

/**
 * Justificatif de paiement ou ticket d'une opération (`/justificatif/operation/:id` ou
 * `/justificatif/achat/:id`). Il n'existe qu'après la confirmation du paiement par le serveur.
 */
export function ReceiptPage() {
  const { source, id } = useParams()
  const purchases = usePurchases()

  const receipt =
    source === 'operation'
      ? receiptForTransaction(id)
      : source === 'achat'
        ? receiptForPurchase(purchases.find((purchase) => purchase.id === id))
        : undefined
  const back = receipt?.backTo ?? paths.wallet

  return (
    <>
      <PageHeader
        title={receipt?.kind === 'ticket' ? 'Ticket' : 'Justificatif'}
        leading={<BackLink to={back} label="Retour" history />}
      />
      {receipt ? (
        <div className="space-y-4 px-4 py-4">
          <ReceiptCard receipt={receipt} />
          <div className="mx-auto grid max-w-sm gap-2">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => download(receipt)}
            >
              <Download aria-hidden="true" />
              Télécharger
            </Button>
            <Link to={paths.wallet} className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              Retour au Wallet
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ReceiptText}
          tone="info"
          title="Justificatif indisponible"
          description="Un justificatif n’est généré qu’après la confirmation du paiement par le serveur. Une demande en attente, refusée ou annulée n’en produit pas."
          action={
            <Link to={paths.wallet} className={buttonVariants()}>
              Mon Wallet
            </Link>
          }
          className="py-20"
        />
      )}
    </>
  )
}
