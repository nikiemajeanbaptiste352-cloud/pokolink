import { zodResolver } from '@hookform/resolvers/zod'
import { Send, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { addLearnComment } from '@/lib/learn-store'
import type { LearnComment } from '@/types/learn'

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, 'Écrivez au moins 2 caractères.')
    .max(1000, '1 000 caractères au maximum.'),
})

type CommentValues = z.infer<typeof commentSchema>

interface CommentFormProps {
  postId: string
  /** Question : le champ s'appelle « réponse » plutôt que « commentaire ». */
  isQuestion: boolean
  replyingTo: LearnComment | null
  onCancelReply: () => void
}

/** Réponse / commentaire : stocké localement (fil + contributions + page membre). */
export function CommentForm({
  postId,
  isQuestion,
  replyingTo,
  onCancelReply,
}: CommentFormProps) {
  const [notice, setNotice] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })
  const noun = isQuestion ? 'réponse' : 'commentaire'

  return (
    <form
      onSubmit={(event) =>
        void handleSubmit((values) => {
          addLearnComment({
            postId,
            content: values.content,
            parentId: replyingTo?.id ?? null,
          })
          setNotice(
            `Votre ${noun} est visible ici et sur « Mes contributions ». Avec le serveur, l’auteur serait notifié.`,
          )
          reset()
          onCancelReply()
        })(event)
      }
      noValidate
      className="space-y-3 px-4 py-4"
    >
      {replyingTo ? (
        <div className="flex items-center gap-2 rounded-xl bg-accent px-3.5 py-1 text-body text-accent-foreground">
          <span className="min-w-0 flex-1 truncate">
            Réponse à <strong>{replyingTo.author.name}</strong>
          </span>
          <button
            type="button"
            aria-label="Annuler la réponse à ce commentaire"
            onClick={onCancelReply}
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-black/5"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <Field
        id="comment-content"
        label={isQuestion ? 'Votre réponse' : 'Votre commentaire'}
        error={errors.content?.message}
      >
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            placeholder={
              isQuestion
                ? 'Expliquez la méthode, pas seulement le résultat…'
                : 'Écrivez ici…'
            }
            {...register('content')}
          />
        )}
      </Field>
      <Button type="submit" className="w-full">
        <Send aria-hidden="true" />
        Publier la {noun}
      </Button>
      <p role="status" className="text-caption text-muted-foreground empty:hidden">
        {notice}
      </p>
    </form>
  )
}
