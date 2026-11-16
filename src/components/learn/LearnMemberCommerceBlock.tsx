import { BookOpen, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useAfriLearnCommerce,
  usePublishedEduProducts,
} from '@/hooks/use-afrilearn-commerce'
import {
  getLearnMemberCommerceStats,
  isLearnOwnHandle,
} from '@/lib/afrilearn-member-stats'
import { LEARN_EDU_KIND_LABEL } from '@/lib/afrilearn-commerce-labels'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

/**
 * Bloc commerce sur le profil public AfriLearn (vitrine uniquement).
 * La gestion du canal reste dans Mon AfriLearn, pas ici.
 */
export function LearnMemberCommerceBlock({ handle }: { handle: string }) {
  useAfriLearnCommerce()
  const own = isLearnOwnHandle(handle)
  const stats = getLearnMemberCommerceStats(handle)
  const products = usePublishedEduProducts().filter(
    (p) => p.sellerHandle.toLowerCase() === handle.replace(/^@/, '').toLowerCase(),
  )

  if (!stats.canalPublished && products.length === 0) {
    return null
  }

  return (
    <section aria-label="Canal et produits" className="space-y-3 px-4 pb-4">
      <h2 className="text-title font-extrabold">Canal & boutique</h2>

      <dl className="grid grid-cols-3 gap-2 rounded-2xl border bg-card p-3 shadow-card">
        <div>
          <dt className="text-[10px] font-semibold text-muted-foreground uppercase">
            Canal
          </dt>
          <dd className="text-[13px] font-extrabold">
            {stats.canalPublished ? 'Public' : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold text-muted-foreground uppercase">
            Produits
          </dt>
          <dd className="text-[13px] font-extrabold">{stats.productsPublished}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold text-muted-foreground uppercase">
            Ventes
          </dt>
          <dd className="text-[13px] font-extrabold">
            {own ? stats.salesCount : '—'}
          </dd>
        </div>
      </dl>

      {stats.canalPublished && stats.canalId ? (
        <div className="overflow-hidden rounded-2xl border border-info/30 bg-card shadow-card">
          <Link
            to={paths.learnCanalPublic(stats.canalId)}
            className="flex items-center gap-3 p-3.5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-info/15 text-info ring-2 ring-info/25">
              <Radio className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">{stats.canalName}</span>
              <span className="block text-caption text-muted-foreground">
                Page publique du Canal Pro
              </span>
            </span>
          </Link>
          {!own ? (
            <Link
              to={paths.learnCanalSubscribe(stats.canalId)}
              className="block border-t border-info/20 bg-brand px-3.5 py-2.5 text-center text-[13px] font-extrabold text-brand-foreground"
            >
              S’abonner · paiement Wallet
            </Link>
          ) : null}
        </div>
      ) : null}

      {products.length > 0 ? (
        <ul className="space-y-2">
          {products.slice(0, 4).map((p) => (
            <li key={p.id}>
              <Link
                to={paths.learnEduProduct(p.id)}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <BookOpen className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{p.name}</span>
                  <span className="block text-caption text-muted-foreground">
                    {LEARN_EDU_KIND_LABEL[p.kind]}
                  </span>
                </span>
                <span className="shrink-0 font-extrabold tabular-nums text-brand">
                  {formatPrice(p.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
