import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { FilterChips } from '@/components/common/FilterChips'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { SwitchRow } from '@/components/form/SwitchRow'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceItems, useServices } from '@/hooks/use-services'
import { getCategories } from '@/lib/catalog'
import { catalogItemSchema, type CatalogItemValues } from '@/lib/service-schemas'
import { getServiceTypeMeta } from '@/lib/service-types'
import { paths } from '@/routes/paths'
import type { CatalogItem, StockMode } from '@/types/service'

const STOCK_MODES: readonly { id: StockMode; label: string }[] = [
  { id: 'quantity', label: 'Suivre la quantité' },
  { id: 'availability', label: 'Disponible ou non' },
]

function toFormValues(item: CatalogItem): CatalogItemValues {
  return {
    name: item.name,
    image: item.image,
    description: item.description,
    price: item.price,
    category: item.category,
    stockMode: item.stockMode,
    quantity: item.quantity,
    available: item.available,
    allowMerchantCredit: item.allowMerchantCredit ?? false,
    options: item.options,
  }
}

/** Ajout (`/catalogue/nouveau`) ou modification d'un élément du catalogue. */
export function CatalogItemFormPage() {
  const service = useCurrentService()
  const { itemId } = useParams()
  const items = useServiceItems(service.id)
  const existing = itemId ? items.find((i) => i.id === itemId) : undefined

  // Un élément d'un autre service est introuvable ici : les catalogues sont isolés.
  if (itemId && !existing) {
    return <ServiceNotFound backTo={paths.serviceCatalog(service.id)} />
  }

  return <CatalogItemForm key={existing?.id ?? 'new'} existing={existing} />
}

function CatalogItemForm({ existing }: { existing: CatalogItem | undefined }) {
  const service = useCurrentService()
  const navigate = useNavigate()
  const { addItem, updateItem, removeItem } = useServices()
  const items = useServiceItems(service.id)
  const meta = getServiceTypeMeta(service.type)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CatalogItemValues>({
    resolver: zodResolver(catalogItemSchema),
    defaultValues: existing
      ? toFormValues(existing)
      : {
          name: '',
          image: '',
          description: '',
          category: '',
          stockMode: 'quantity',
          quantity: 1,
          available: true,
          allowMerchantCredit: false,
          price: 0,
          options: [],
        },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const stockMode = useWatch({ control, name: 'stockMode' })
  const description = useWatch({ control, name: 'description' })

  const suggestions = [...new Set([...meta.categories, ...getCategories(items)])]
  const catalogPath = paths.serviceCatalog(service.id)
  // Une modification revient à la fiche produit ; un ajout, au catalogue.
  const backTo = existing ? paths.serviceItem(service.id, existing.id) : catalogPath

  function onSubmit(values: CatalogItemValues) {
    const payload: CatalogItemValues = {
      ...values,
      // Sans autorisation établissement, aucun article ne peut activer le crédit.
      allowMerchantCredit: service.allowMerchantCredit
        ? values.allowMerchantCredit
        : false,
    }
    if (existing) updateItem(existing.id, payload)
    else addItem(service.id, payload)
    void navigate(backTo)
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="space-y-6 px-4 py-6"
    >
      <div className="flex items-center gap-2">
        <BackLink
          to={backTo}
          label={existing ? 'Fiche produit' : 'Catalogue'}
          className="-ml-2"
        />
        <h2 className="text-headline font-extrabold">
          {existing ? `Modifier : ${existing.name}` : 'Nouvel élément'}
        </h2>
      </div>

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageField
            label="Image"
            value={field.value}
            onChange={field.onChange}
            icon={meta.icon}
            tone={meta.tone}
            maxSize={640}
            shape="wide"
          />
        )}
      />

      <Field id="item-name" label="Nom" error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register('name')} maxLength={80} />}
      </Field>

      <Field
        id="item-description"
        label="Description"
        optional
        hint={`${description.length}/300 caractères`}
        error={errors.description?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register('description')} maxLength={300} />}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="item-price" label="Prix (FCFA)" error={errors.price?.message}>
          {(a11y) => (
            <Input
              {...a11y}
              {...register('price', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Ex. 2500"
            />
          )}
        </Field>
        <Field id="item-category" label="Catégorie" error={errors.category?.message}>
          {(a11y) => (
            <>
              <Input
                {...a11y}
                {...register('category')}
                list="item-category-list"
                maxLength={40}
                placeholder={`Ex. ${meta.categories[0] ?? 'Catégorie'}`}
              />
              <datalist id="item-category-list">
                {suggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-body font-semibold">
          Quantité ou disponibilité
        </legend>
        <Controller
          control={control}
          name="stockMode"
          render={({ field }) => (
            <FilterChips
              label="Mode de suivi"
              items={STOCK_MODES}
              value={field.value}
              onChange={field.onChange}
              className="px-0"
            />
          )}
        />
        {stockMode === 'quantity' ? (
          <Field
            id="item-quantity"
            label="Quantité en stock"
            error={errors.quantity?.message}
          >
            {(a11y) => (
              <Input
                {...a11y}
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
              />
            )}
          </Field>
        ) : (
          <Controller
            control={control}
            name="available"
            render={({ field }) => (
              <div className="rounded-xl border bg-card px-3 shadow-card">
                <SwitchRow
                  label="Disponible à la vente"
                  description="Désactivez pour le marquer indisponible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-body font-semibold">Crédit commerçant</legend>
        {service.allowMerchantCredit ? (
          <Controller
            control={control}
            name="allowMerchantCredit"
            render={({ field }) => (
              <div className="rounded-xl border bg-card px-3 shadow-card">
                <SwitchRow
                  label="Autoriser l’achat à crédit"
                  description="Uniquement pour cet article. Visible au paiement si le client choisit de reporter une partie."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/40 px-3.5 py-3">
            <p className="text-[12px] font-bold">Crédit désactivé pour l’établissement</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              Activez d’abord « Autoriser le crédit commerçant » dans Configuration →
              Paiements, puis autorisez-le article par article.
            </p>
            <button
              type="button"
              className="mt-2 text-[12px] font-bold text-brand"
              onClick={() =>
                void navigate(paths.serviceCreditConfig(service.id))
              }
            >
              Ouvrir la configuration du crédit ›
            </button>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-body font-semibold">
          Options <span className="font-normal text-muted-foreground">(facultatif)</span>
        </legend>
        <p className="text-caption text-muted-foreground">
          Ex. taille, sauce, couleur, avec un éventuel supplément de prix.
        </p>
        {fields.map((option, index) => (
          <div key={option.id} className="flex items-start gap-2">
            <Field
              id={`option-name-${index}`}
              label={`Option ${index + 1}`}
              error={errors.options?.[index]?.name?.message}
              className="min-w-0 flex-1"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register(`options.${index}.name`)}
                  maxLength={40}
                  placeholder="Ex. Grande taille"
                />
              )}
            </Field>
            <Field
              id={`option-price-${index}`}
              label="Supplément"
              error={errors.options?.[index]?.extraPrice?.message}
              className="w-28 shrink-0"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register(`options.${index}.extraPrice`, { valueAsNumber: true })}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                />
              )}
            </Field>
            <Button
              size="icon"
              variant="ghost"
              className="mt-7"
              aria-label={`Retirer l’option ${index + 1}`}
              onClick={() => remove(index)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => append({ name: '', extraPrice: 0 })}>
          <Plus aria-hidden="true" />
          Ajouter une option
        </Button>
      </fieldset>

      <div className="flex flex-col gap-3 pt-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {existing ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
        </Button>

        {existing ? (
          confirmingDelete ? (
            <div className="space-y-3 rounded-xl border border-destructive/40 p-4">
              <p className="text-body">Supprimer « {existing.name} » du catalogue ?</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  onClick={() => {
                    removeItem(existing.id)
                    void navigate(catalogPath, { replace: true })
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  Oui, supprimer
                </Button>
                <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="lg" onClick={() => setConfirmingDelete(true)}>
              <Trash2 aria-hidden="true" />
              Supprimer cet élément
            </Button>
          )
        ) : null}
      </div>
    </form>
  )
}
