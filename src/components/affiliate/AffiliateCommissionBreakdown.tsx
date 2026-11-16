import { Handshake, Info } from 'lucide-react'

import {
  AFRICONNECT_AFFILIATE_PLATFORM_RATE,
  formatRatePct,
  simulateSplit,
} from '@/lib/affiliate-labels'
import {
  getActiveAttribution,
  getAffiliateMemberships,
  getProgramById,
} from '@/lib/affiliate-store'
import { formatPrice } from '@/lib/format'

/**
 * Aperçu de la répartition d’un paiement commercial attribué à un affilié.
 *
 * Logique (l’acheteur paie le prix plein ; les commissions sont prélevées sur le vendeur) :
 * 1. Le client a cliqué un lien `?aff=` → attribution last-click 30 jours.
 * 2. À la confirmation du paiement Wallet :
 *    - AfriConnect : 5 % (taux plateforme fixe)
 *    - Partenaire affilié : taux du programme (ex. 10 %) → crédité sur son compte affiliation
 *    - Vendeur : le reste
 * 3. Participation Market Event / loterie ≠ cet achat commercial (parcours séparé).
 */
export function AffiliateCommissionBreakdown({
  serviceId,
  amount,
}: {
  serviceId: string
  amount: number
}) {
  if (!(amount > 0)) return null

  const attr = getActiveAttribution(serviceId)
  if (!attr) return null

  const member = getAffiliateMemberships().find(
    (m) => m.refCode === attr.refCode && m.status === 'active',
  )
  if (!member || member.serviceId !== serviceId) return null

  const program = getProgramById(member.programId)
  if (!program || program.status !== 'published') return null

  const split = simulateSplit(
    amount,
    program.affiliateRate,
    program.platformRate ?? AFRICONNECT_AFFILIATE_PLATFORM_RATE,
  )

  return (
    <section
      aria-label="Commissions partenaires"
      className="space-y-2 rounded-2xl border border-brand/30 bg-brand/5 px-3.5 py-3"
    >
      <div className="flex items-start gap-2">
        <Handshake className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        <div className="min-w-0 space-y-0.5">
          <p className="text-[12px] font-extrabold text-brand">
            Vente attribuée à un partenaire
          </p>
          <p className="text-caption text-muted-foreground">
            Via @{member.affiliateHandle} · {program.name} · vous payez{' '}
            {formatPrice(amount)} (prix plein). Les commissions sont déduites du
            vendeur, pas ajoutées à votre paiement.
          </p>
        </div>
      </div>

      <dl className="divide-y rounded-xl border bg-card px-3 text-caption">
        <div className="flex justify-between gap-3 py-2">
          <dt className="text-muted-foreground">
            Partenaire ({formatRatePct(program.affiliateRate)})
          </dt>
          <dd className="font-extrabold text-brand tabular-nums">
            +{formatPrice(split.affiliate)} crédités
          </dd>
        </div>
        <div className="flex justify-between gap-3 py-2">
          <dt className="text-muted-foreground">
            AfriConnect ({formatRatePct(program.platformRate)})
          </dt>
          <dd className="font-semibold tabular-nums">
            {formatPrice(split.platform)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 py-2">
          <dt className="text-muted-foreground">Net vendeur</dt>
          <dd className="font-semibold tabular-nums">
            {formatPrice(split.vendor)}
          </dd>
        </div>
      </dl>

      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Après confirmation, la commission partenaire est créditée sur son espace
        Affiliation (Studio). Ce n’est pas le paiement d’une participation Market
        Event.
      </p>
    </section>
  )
}
