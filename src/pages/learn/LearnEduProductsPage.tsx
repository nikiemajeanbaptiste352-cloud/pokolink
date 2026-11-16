import { BookOpen, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { useSellerEduProducts } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  LEARN_EDU_KIND_LABEL,
  LEARN_EDU_STATUS_LABEL,
} from '@/lib/afrilearn-commerce-labels'
import { setEduProductStatus } from '@/lib/afrilearn-commerce-store'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

/** Liste privée des produits éducatifs du vendeur. */
export function LearnEduProductsPage() {
  const profile = useProfile()
  const products = useSellerEduProducts(profile.handle)

  return (
    <>
      <PageHeader
        title="Mes produits éducatifs"
        leading={<BackLink to={paths.learnMine} label="Mon AfriLearn" history />}
        actions={
          <Link
            to={paths.learnEduProductNew}
            className={buttonVariants({ size: 'sm' })}
          >
            <Plus aria-hidden="true" />
            Ajouter
          </Link>
        }
      />
      <div className="px-4 pb-10">
        {products.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucun produit"
            description="Publiez un livre, une fiche ou un support de cours."
            action={
              <Link to={paths.learnEduProductNew} className={buttonVariants()}>
                Créer un produit
              </Link>
            }
            className="py-12"
          />
        ) : (
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border bg-card p-3.5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold">{p.name}</p>
                    <p className="text-caption text-muted-foreground">
                      {LEARN_EDU_KIND_LABEL[p.kind]} ·{' '}
                      {LEARN_EDU_STATUS_LABEL[p.status]} · {formatPrice(p.price)}
                    </p>
                  </div>
                  <Link
                    to={paths.learnEduProductEdit(p.id)}
                    className="text-[12px] font-bold text-brand"
                  >
                    Modifier
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.status !== 'published' ? (
                    <button
                      type="button"
                      className="text-[12px] font-bold text-brand"
                      onClick={() => setEduProductStatus(p.id, 'published')}
                    >
                      Publier
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-[12px] font-bold text-muted-foreground"
                      onClick={() => setEduProductStatus(p.id, 'draft')}
                    >
                      Dépublier
                    </button>
                  )}
                  {p.status === 'published' ? (
                    <Link
                      to={paths.learnEduProduct(p.id)}
                      className="text-[12px] font-bold text-brand"
                    >
                      Voir public ›
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
