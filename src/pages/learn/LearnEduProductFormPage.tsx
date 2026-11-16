import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { Field } from '@/components/form/Field'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useProfile } from '@/hooks/use-profile'
import {
  LEARN_EDU_DELIVERY_LABEL,
  LEARN_EDU_KIND_LABEL,
} from '@/lib/afrilearn-commerce-labels'
import { findEduProduct, saveEduProduct } from '@/lib/afrilearn-commerce-store'
import { paths } from '@/routes/paths'
import type {
  LearnEduDelivery,
  LearnEduProductKind,
  LearnEduPublishStatus,
} from '@/types/afrilearn-commerce'

const KINDS = Object.keys(LEARN_EDU_KIND_LABEL) as LearnEduProductKind[]
const DELIVERIES = Object.keys(LEARN_EDU_DELIVERY_LABEL) as LearnEduDelivery[]

/** Création / modification d’un produit éducatif. */
export function LearnEduProductFormPage() {
  const { productId } = useParams()
  const existing = findEduProduct(productId)
  const profile = useProfile()
  const navigate = useNavigate()

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [kind, setKind] = useState<LearnEduProductKind>(existing?.kind ?? 'ebook')
  const [delivery, setDelivery] = useState<LearnEduDelivery>(
    existing?.delivery ?? 'download',
  )
  const [price, setPrice] = useState(existing?.price ?? 0)
  const [preview, setPreview] = useState(existing?.preview ?? '')
  const [digitalContent, setDigitalContent] = useState(
    existing?.digitalContent ?? '',
  )
  const [stock, setStock] = useState(existing?.stock ?? 10)
  const [status, setStatus] = useState<LearnEduPublishStatus>(
    existing?.status ?? 'draft',
  )

  const digital = delivery === 'download' || delivery === 'online'

  function submit() {
    if (name.trim().length < 2 || !(price >= 0)) return
    const saved = saveEduProduct({
      ...(existing ? { id: existing.id } : {}),
      sellerHandle: profile.handle,
      sellerName: profile.name,
      name: name.trim(),
      description: description.trim(),
      category: kind,
      image: existing?.image ?? '',
      price: Math.floor(price),
      kind,
      delivery,
      ...(preview.trim() ? { preview: preview.trim() } : {}),
      ...(digital && digitalContent.trim()
        ? { digitalContent: digitalContent.trim() }
        : {}),
      ...(!digital ? { stock: Math.max(0, Math.floor(stock)) } : {}),
      status,
    })
    void navigate(paths.learnEduProducts)
    return saved
  }

  return (
    <>
      <PageHeader
        title={existing ? 'Modifier le produit' : 'Nouveau produit'}
        leading={
          <BackLink to={paths.learnEduProducts} label="Mes produits" history />
        }
      />
      <div className="space-y-4 px-4 pb-10">
        <Field id="edu-name" label="Nom du produit">
          {(a11y) => (
            <Input
              {...a11y}
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>
        <Field id="edu-desc" label="Description">
          {(a11y) => (
            <Textarea
              {...a11y}
              value={description}
              maxLength={600}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
        </Field>

        <label className="block space-y-1.5">
          <span className="text-body font-semibold">Catégorie / type</span>
          <select
            className="h-11 w-full rounded-xl border bg-background px-3 text-body"
            value={kind}
            onChange={(e) => setKind(e.target.value as LearnEduProductKind)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {LEARN_EDU_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-body font-semibold">Mode de livraison / accès</span>
          <select
            className="h-11 w-full rounded-xl border bg-background px-3 text-body"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value as LearnEduDelivery)}
          >
            {DELIVERIES.map((d) => (
              <option key={d} value={d}>
                {LEARN_EDU_DELIVERY_LABEL[d]}
              </option>
            ))}
          </select>
        </label>

        <Field id="edu-price" label="Prix (FCFA)">
          {(a11y) => (
            <Input
              {...a11y}
              type="number"
              inputMode="numeric"
              min={0}
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
            />
          )}
        </Field>

        <Field id="edu-preview" label="Aperçu public" optional>
          {(a11y) => (
            <Textarea
              {...a11y}
              value={preview}
              maxLength={300}
              rows={2}
              onChange={(e) => setPreview(e.target.value)}
            />
          )}
        </Field>

        {digital ? (
          <Field
            id="edu-file"
            label="Contenu numérique (lien ou texte)"
            hint="Accessible uniquement après paiement confirmé"
          >
            {(a11y) => (
              <Textarea
                {...a11y}
                value={digitalContent}
                rows={3}
                onChange={(e) => setDigitalContent(e.target.value)}
                placeholder="URL fichier ou contenu réservé…"
              />
            )}
          </Field>
        ) : (
          <Field id="edu-stock" label="Quantité disponible">
            {(a11y) => (
              <Input
                {...a11y}
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value) || 0)}
              />
            )}
          </Field>
        )}

        <label className="block space-y-1.5">
          <span className="text-body font-semibold">Statut</span>
          <select
            className="h-11 w-full rounded-xl border bg-background px-3 text-body"
            value={status}
            onChange={(e) => setStatus(e.target.value as LearnEduPublishStatus)}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </label>

        <Button type="button" size="lg" className="w-full" onClick={submit}>
          Enregistrer
        </Button>
      </div>
    </>
  )
}
