import { TriangleAlert } from 'lucide-react'

import { SectionHeader } from '@/components/common/SectionHeader'
import { TEMP_COIN_PARAMS } from '@/lib/placeholder-coin-markets'

/** Règles publiées avant l'achat et avertissements. Texte, sans calcul. */
export function CoinRules() {
  const { indexMin, indexMax, updateEveryMinutes, referencePeriods } = TEMP_COIN_PARAMS
  const rules = [
    'Achats : vous achetez des coins avant le début, dans la limite des coins disponibles. Plusieurs coins sont possibles. Aucun achat n’est accepté après le début.',
    'Début : à l’heure prévue, les achats sont fermés pour de bon et le nombre de coins est figé. Même si tous les coins sont vendus avant, l’indice ne bouge qu’à partir du début.',
    `Indice : il part de 100 et suit la popularité de la vidéo (vues validées uniquement, vues suspectes écartées). Il reste toujours entre ${indexMin} et ${indexMax}. Mise à jour toutes les ${updateEveryMinutes} min, avec ${referencePeriods} périodes de référence.`,
    'Valeur d’un coin : prix initial × indice ÷ 100. Exemple : à 100 FCFA, un indice de 120 vaut 120 FCFA par coin.',
    'Valeur théorique : c’est une valorisation, pas une somme garantie. Elle n’est jamais payée au-delà des fonds du pool.',
    'Pool : il est financé uniquement par l’argent des achats de coins. Rien n’est créé en plus : le total des retraits ne peut jamais dépasser ce qui a été collecté.',
    'Retraits : ouverts pendant l’événement. Chaque demande est vérifiée contre le solde réel avant que vos coins soient débités. Une demande en attente n’est pas un paiement terminé.',
    'Clôture : l’événement s’arrête quand le pool est épuisé ou à l’heure prévue. Vos coins et votre historique sont conservés ; un règlement traite ensuite les détenteurs restants.',
  ]

  return (
    <>
      <section className="space-y-3 py-4">
        <SectionHeader title="Règles de l’événement" />
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
          <p className="font-bold">À savoir avant tout achat</p>
          <p>
            <strong>Premier retrait, premier payé.</strong> Dans cette version proposée,
            les retraits sont payés dans l’ordre jusqu’à épuisement du pool. Les derniers
            détenteurs peuvent donc recevoir moins que la valeur théorique, ou rien. Cette
            règle reste à valider.
          </p>
          <p>
            Vous pouvez perdre tout ou partie de ce que vous avez payé : l’indice peut
            baisser jusqu’à {indexMin}, et le pool peut être épuisé avant votre retrait.
          </p>
        </div>
      </div>
    </>
  )
}
