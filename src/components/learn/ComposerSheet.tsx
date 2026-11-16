import { zodResolver } from '@hookform/resolvers/zod'
import { Paperclip, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { addLearnPost } from '@/lib/learn-store'
import { cn } from '@/lib/utils'
import type { LearnPostType } from '@/types/learn'

import {
  formatFileSize,
  getFileExtension,
  POST_TYPE_META,
  UPLOAD_RULES,
} from './learn-utils'

/** Types qu'un membre peut publier (les annonces sont réservées aux modérateurs). */
const COMPOSER_TYPES = [
  'text',
  'question',
  'exercice',
  'corrige',
  'examen',
  'document',
] as const satisfies readonly LearnPostType[]

type ComposerType = (typeof COMPOSER_TYPES)[number]

const composerSchema = z
  .object({
    type: z.enum(COMPOSER_TYPES),
    title: z.string().trim().max(120, '120 caractères au maximum.'),
    content: z
      .string()
      .trim()
      .min(3, 'Écrivez au moins 3 caractères.')
      .max(2000, '2 000 caractères au maximum.'),
  })
  .superRefine((value, context) => {
    if (value.type !== 'text' && value.title.length < 3) {
      context.addIssue({
        code: 'custom',
        path: ['title'],
        message: 'Donnez un titre d’au moins 3 caractères.',
      })
    }
  })

type ComposerValues = z.infer<typeof composerSchema>

const PLACEHOLDER: Record<ComposerType, string> = {
  text: 'Partagez une idée ou lancez une discussion…',
  question: 'Expliquez où vous bloquez et ce que vous avez déjà essayé…',
  exercice: 'Décrivez l’exercice ou la série partagée…',
  corrige: 'Indiquez l’épreuve, l’année et le niveau du corrigé…',
  examen: 'Indiquez l’épreuve, l’année et la durée…',
  document: 'Décrivez le contenu du document…',
}

interface ComposerSheetProps {
  open: boolean
  levelId: string
  levelName: string
  /** Type présélectionné à l'ouverture (ex. « document » depuis le raccourci de la bibliothèque). */
  initialType?: ComposerType
  onClose: () => void
}

/**
 * Création d'une publication ou d'un document. En démo : stocké localement (fil + Moi + page publique).
 * Le serveur vérifiera type, taille et contenu une fois branché.
 */
export function ComposerSheet({
  open,
  levelId,
  levelName,
  initialType = 'text',
  onClose,
}: ComposerSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Publier"
      subtitle={`Dans le fil ${levelName}`}
    >
      <ComposerForm levelId={levelId} initialType={initialType} onClose={onClose} />
    </BottomSheet>
  )
}

function ComposerForm({
  levelId,
  initialType,
  onClose,
}: {
  levelId: string
  initialType: ComposerType
  onClose: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: { type: initialType, title: '', content: '' },
  })
  const type = useWatch({ control, name: 'type' })

  function checkFile(candidate: File | null, required: boolean): string {
    if (!candidate) return required ? 'Ajoutez le fichier à partager.' : ''
    if (
      !(UPLOAD_RULES.extensions as readonly string[]).includes(
        getFileExtension(candidate.name),
      )
    ) {
      return 'Format non accepté : PDF, Word (DOCX), JPG ou PNG.'
    }
    if (candidate.size > UPLOAD_RULES.maxBytes) {
      return `Fichier trop lourd : ${formatFileSize(UPLOAD_RULES.maxBytes)} au maximum.`
    }
    return ''
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null
    setFile(picked)
    setFileError(checkFile(picked, false))
  }

  function onSubmit(values: ComposerValues) {
    const error = checkFile(file, values.type === 'document')
    setFileError(error)
    if (error) return
    addLearnPost({
      levelId,
      type: values.type,
      title: values.title,
      content: values.content,
      file: file ? { name: file.name, size: file.size } : null,
    })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-xl bg-muted p-4 text-body">
          Publié sur cet appareil : visible dans le fil, « Mes contributions » et votre
          page publique AfriLearn. Avec le serveur, un filtre automatique s’appliquera
          {file ? ' et le fichier sera analysé avant stockage' : ''}.
        </p>
        <Button type="button" className="w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="space-y-4"
    >
      <fieldset className="space-y-2">
        <legend className="mb-1 text-body font-semibold">Type de publication</legend>
        <div className="grid grid-cols-3 gap-2">
          {COMPOSER_TYPES.map((id) => {
            const { label, icon: Icon } = POST_TYPE_META[id]
            return (
              <label
                key={id}
                className={cn(
                  'flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border bg-card px-1 py-2 text-center text-caption font-semibold',
                  'has-checked:border-brand has-checked:bg-accent has-focus-visible:outline-2 has-focus-visible:outline-ring',
                )}
              >
                <input
                  type="radio"
                  value={id}
                  className="sr-only"
                  {...register('type')}
                />
                <Icon className="size-5 text-brand" aria-hidden="true" />
                {label}
              </label>
            )
          })}
        </div>
      </fieldset>

      {type !== 'text' ? (
        <Field id="composer-title" label="Titre" error={errors.title?.message}>
          {(control) => (
            <Input
              {...control}
              placeholder={type === 'question' ? 'Votre question en une phrase' : 'Titre'}
              {...register('title')}
            />
          )}
        </Field>
      ) : null}

      <Field
        id="composer-content"
        label={type === 'question' ? 'Détails' : 'Message'}
        error={errors.content?.message}
      >
        {(control) => (
          <Textarea
            {...control}
            rows={4}
            placeholder={PLACEHOLDER[type]}
            {...register('content')}
          />
        )}
      </Field>

      <div className="space-y-1.5">
        <span id="composer-file-label" className="block text-body font-semibold">
          Fichier
          {type === 'document' ? null : (
            <span className="font-normal text-muted-foreground"> (facultatif)</span>
          )}
        </span>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={onFileChange}
          aria-labelledby="composer-file-label"
          aria-describedby="composer-file-hint composer-file-error"
          className="sr-only"
          tabIndex={-1}
        />
        {file ? (
          <div className="flex min-h-11 items-center gap-3 rounded-xl border bg-card px-3.5 py-2">
            <Paperclip className="size-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold">{file.name}</span>
              <span className="block text-caption text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </span>
            <button
              type="button"
              aria-label="Retirer le fichier"
              onClick={() => {
                setFile(null)
                setFileError('')
                if (fileInput.current) fileInput.current.value = ''
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInput.current?.click()}
          >
            <Paperclip aria-hidden="true" />
            Choisir un fichier
          </Button>
        )}
        <p id="composer-file-hint" className="text-caption text-muted-foreground">
          PDF, Word, JPG ou PNG, {formatFileSize(UPLOAD_RULES.maxBytes)} au maximum. Le
          serveur vérifie chaque fichier avant de le publier.
        </p>
        <p
          id="composer-file-error"
          role="alert"
          className="text-caption font-medium text-danger empty:hidden"
        >
          {fileError}
        </p>
      </div>

      <Button type="submit" className="w-full">
        Publier
      </Button>
    </form>
  )
}
