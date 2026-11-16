import { BookOpen, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import {
  usePublishedEduProducts,
  usePublishedLearnCanals,
} from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  hasCanalMemberAccess,
} from '@/lib/afrilearn-commerce-store'
import { LEARN_EDU_KIND_LABEL } from '@/lib/afrilearn-commerce-labels'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

/** Partie publique : canaux éducatifs + marché des produits. */
export function LearnMarketPage() {
  const canals = usePublishedLearnCanals()
  const products = usePublishedEduProducts()
  const profile = useProfile()
  const me = profile.handle.replace(/^@/, '').toLowerCase()

  return (
    <>
      <PageHeader
        title="Marché éducatif"
        leading={<BackLink to={paths.learn} label="AfriLearn" history />}
      />
      <div className="space-y-6 px-4 pb-10">
        <section className="space-y-3">
          <h2 className="text-body font-extrabold">Canaux Pro</h2>
          {canals.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              Aucun canal publié pour le moment.
            </p>
          ) : (
            <ul className="space-y-2">
              {canals.map((c) => {
                const own = c.ownerHandle.toLowerCase() === me
                const subscribed = hasCanalMemberAccess(c.id, profile.handle)
                const primaryTo = own
                  ? paths.learnCanalAccess(c.id)
                  : subscribed
                    ? paths.learnCanalAccess(c.id)
                    : c.memberPlansEnabled
                      ? paths.learnCanalSubscribe(c.id)
                      : paths.learnCanalPublic(c.id)
                const cta = own
                  ? 'Accéder · mon canal'
                  : subscribed
                    ? 'Accéder au canal'
                    : c.memberPlansEnabled
                      ? 'S’abonner · paiement Wallet'
                      : 'Voir la page publique'

                return (
                  <li key={c.id}>
                    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
                      <Link
                        to={paths.learnCanalPublic(c.id)}
                        aria-label={`Page publique · ${c.name}`}
                        className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-info/15 text-info ring-2 ring-info/25"
                      >
                        {c.logo ? (
                          <img
                            src={c.logo}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Radio className="size-5" aria-hidden="true" />
                        )}
                      </Link>
                      <Link to={primaryTo} className="min-w-0 flex-1">
                        <span className="block font-extrabold">{c.name}</span>
                        <span className="block truncate text-caption text-muted-foreground">
                          {c.tagline || c.description || `@${c.ownerHandle}`}
                        </span>
                        <span className="mt-0.5 block text-[12px] font-bold text-brand">
                          {cta}
                        </span>
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-body font-extrabold">Produits éducatifs</h2>
          {products.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Aucun produit"
              description="Les livres et supports publiés apparaîtront ici."
              className="py-8"
            />
          ) : (
            <ul className="space-y-2">
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    to={paths.learnEduProduct(p.id)}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                      <BookOpen className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold">{p.name}</span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {LEARN_EDU_KIND_LABEL[p.kind]} · @{p.sellerHandle}
                      </span>
                    </span>
                    <span className="shrink-0 font-extrabold tabular-nums text-brand">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
