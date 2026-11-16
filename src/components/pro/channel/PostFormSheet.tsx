import { zodResolver } from '@hookform/resolvers/zod'
import { Film, ImagePlus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { BottomSheet } from '@/components/common/BottomSheet'
import { FilterChips } from '@/components/common/FilterChips'
import { Field } from '@/components/form/Field'
import { PartnershipLinkField } from '@/components/form/PartnershipLinkField'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatPrice } from '@/lib/format'
import { readImageAsDataUrl } from '@/lib/image'
import { normalizePartnershipLink } from '@/lib/partnership-link'
import { POST_TYPE_LABEL } from '@/lib/pro-labels'
import { POST_TYPES, postSchema, type PostValues } from '@/lib/pro-schemas'
import { createId } from '@/lib/ids'
import type { ChannelPost, PostMedia, PostStatus } from '@/types/pro'
import type { CatalogItem } from '@/types/service'

const MAX_MEDIA = 6

interface PostFormSheetProps {
  open: boolean
  /** Publication à modifier, ou `null` pour en créer une. */
  post: ChannelPost | null
  items: readonly CatalogItem[]
  onClose: () => void
  onSave: (post: ChannelPost, status: PostStatus) => void
}

const TYPE_CHIPS = POST_TYPES.map((id) => ({ id, label: POST_TYPE_LABEL[id] }))

/** Création ou modification d'une publication, dans une feuille en bas de l'écran. */
export function PostFormSheet({
  open,
  post,
  items,
  onClose,
  onSave,
}: PostFormSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={post ? 'Modifier la publication' : 'Créer une publication'}
      subtitle="Elle apparaîtra dans le fil de votre canal."
    >
      <PostForm post={post} items={items} onSave={onSave} onCancel={onClose} />
    </BottomSheet>
  )
}

function PostForm({
  post,
  items,
  onSave,
  onCancel,
}: {
  post: ChannelPost | null
  items: readonly CatalogItem[]
  onSave: PostFormSheetProps['onSave']
  onCancel: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mediaError, setMediaError] = useState('')
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: post?.type ?? 'announcement',
      title: post?.title ?? '',
      description: post?.description ?? '',
      media: post?.media ?? [],
      itemId: post?.itemId ?? '',
      promoPrice: post?.promoPrice != null ? String(post.promoPrice) : '',
      partnershipLink: post?.partnershipLink ?? '',
    },
  })

  function submit(status: PostStatus) {
    return handleSubmit((values) => {
      const promoPrice = values.promoPrice === '' ? null : Number(values.promoPrice)
      const item = items.find((candidate) => candidate.id === values.itemId)
      if (promoPrice !== null && item && promoPrice >= item.price) {
        setError('promoPrice', {
          message: `Le prix promotionnel doit être inférieur au prix actuel (${formatPrice(item.price)})`,
        })
        return
      }
      const link = normalizePartnershipLink(values.partnershipLink)
      const now = new Date().toISOString()
      onSave(
        {
          id: post?.id ?? createId(),
          type: values.type,
          title: values.title,
          description: values.description,
          media: values.media,
          itemId: values.itemId,
          promoPrice,
          status,
          publishedAt: status === 'published' ? post?.publishedAt || now : '',
          createdAt: post?.createdAt ?? now,
          views: post?.views ?? 0,
          reactions: post?.reactions ?? 0,
          ...(link ? { partnershipLink: link } : {}),
        },
        status,
      )
    })
  }

  async function addFiles(
    files: FileList | null,
    current: PostMedia[],
    onChange: (next: PostMedia[]) => void,
  ) {
    if (!files) return
    setMediaError('')
    const next = [...current]
    for (const file of Array.from(files)) {
      if (next.length >= MAX_MEDIA) {
        setMediaError(`Six fichiers au maximum.`)
        break
      }
      try {
        if (file.type.startsWith('video/')) {
          // Les vidéos ne sont pas enregistrées dans la démonstration : seul le nom est gardé.
          next.push({ kind: 'video', name: file.name, src: '' })
        } else {
          next.push({
            kind: 'image',
            name: file.name,
            src: await readImageAsDataUrl(file, 1024),
          })
        }
      } catch (cause) {
        setMediaError(cause instanceof Error ? cause.message : 'Fichier invalide.')
      }
    }
    onChange(next)
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="space-y-5">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div className="space-y-1.5">
            <span className="block text-body font-semibold">Type de publication</span>
            <FilterChips
              label="Type de publication"
              items={TYPE_CHIPS}
              value={field.value}
              onChange={field.onChange}
              className="px-0"
            />
          </div>
        )}
      />

      <Field id="post-title" label="Titre" error={errors.title?.message}>
        {(a11y) => <Input {...a11y} {...register('title')} maxLength={80} />}
      </Field>

      <Field
        id="post-description"
        label="Description"
        error={errors.description?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('description')} maxLength={1000} />}
      </Field>

      <Controller
        control={control}
        name="media"
        render={({ field }) => (
          <div className="space-y-2">
            <span className="block text-body font-semibold">
              Photos ou vidéos
              <span className="font-normal text-muted-foreground"> (facultatif)</span>
            </span>
            {field.value.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2">
                {field.value.map((media, index) => (
                  <li
                    key={`${media.name}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl border bg-muted"
                  >
                    {media.kind === 'image' ? (
                      <img
                        src={media.src}
                        alt={media.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="grid size-full place-items-center p-2 text-center text-caption text-muted-foreground">
                        <span>
                          <Film className="mx-auto mb-1 size-6" aria-hidden="true" />
                          <span className="line-clamp-2 break-all">{media.name}</span>
                        </span>
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Retirer ${media.name}`}
                      onClick={() =>
                        field.onChange(field.value.filter((_, i) => i !== index))
                      }
                      className="absolute top-0 right-0 grid size-11 place-items-center"
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-black/70 text-white">
                        <X className="size-4" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button
              variant="outline"
              disabled={field.value.length >= MAX_MEDIA}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              Ajouter des photos ou vidéos
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              aria-label="Choisir des photos ou des vidéos"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                void addFiles(event.target.files, field.value, field.onChange)
                event.target.value = ''
              }}
            />
            {mediaError || errors.media?.message ? (
              <p role="alert" className="text-caption font-medium text-danger">
                {mediaError || errors.media?.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Field id="post-item" label="Produit ou service associé" optional>
        {(a11y) => (
          <Select {...a11y} {...register('itemId')}>
            <option value="">Aucun</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {formatPrice(item.price)}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="post-promo"
        label="Prix promotionnel (FCFA)"
        optional
        error={errors.promoPrice?.message}
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register('promoPrice')}
            inputMode="numeric"
            placeholder="Ex. 2000"
          />
        )}
      </Field>

      <PartnershipLinkField
        id="post-partnership"
        inputProps={register('partnershipLink')}
        error={errors.partnershipLink?.message}
      />

      <div className="grid gap-3">
        <Button type="button" size="lg" onClick={() => void submit('published')()}>
          Publier
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => void submit('draft')()}
        >
          Enregistrer en brouillon
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
