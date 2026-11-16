import { TriangleAlert } from 'lucide-react'

import { SectionHeader } from '@/components/common/SectionHeader'
import type { MarketParams } from '@/types/market'

import { formatCote } from './market-utils'

/** Règles d'évolution du facteur et avertissement sur les points. Texte, sans calcul. */
export function MarketRules({ params }: { params: MarketParams }) {
  const stepPercent = `${(params.maxStep * 100).toFixed(0)} %`
  const rules = [
    'Accélération : si les vues validées de la période récente dépassent la moyenne de référence, le facteur monte.',
    'Ralentissement : si elles sont inférieures, le facteur baisse, même si le total de vues continue d’augmenter.',
    'Stabilité : quand le rythme est proche de la moyenne, le facteur reste presque stable.',
    `Chaque mise à jour modifie le facteur de ${stepPercent} au plus. Il reste toujours entre ${formatCote(params.factorMin)} et ${formatCote(params.factorMax)}.`,
    `Seules les vues validées comptent. Le calcul se fait à intervalles réguliers, sur les ${params.referencePeriods} périodes précédentes ; tant qu’elles ne sont pas écoulées, le facteur reste neutre.`,
    'Si les données sont indisponibles ou incohérentes, le calcul est suspendu : une panne n’est jamais traitée comme une baisse de performance.',
  ]

  return (
    <>
      <section className="space-y-3 py-4">
        <SectionHeader title="Comment évolue le facteur" />
        <ul className="list-disc space-y-2 pr-4 pl-9 text-body">
          {rules.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div
        role="note"
        className="mx-4 mb-4 flex items-start gap-3 rounded-xl bg-warning/20 p-3.5 text-foreground"
      >
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="space-y-2 text-body">
          <p className="font-bold">À savoir avant toute mise</p>
          <p>
            Il n’y a pas d’échanges entre participants dans cette version : le facteur ne
            vient pas d’un prix de marché formé par des achats et des ventes.
          </p>
          <p>
            Vous n’êtes jamais payé au-delà des fonds du pool. Si le pool est insuffisant,
            tous les participants reçoivent le même pourcentage de leur montant et les
            nouvelles positions sont bloquées.
          </p>
        </div>
      </div>
    </>
  )
}
