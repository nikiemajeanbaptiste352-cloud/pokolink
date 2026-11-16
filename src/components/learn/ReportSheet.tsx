import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LearnReportTarget } from '@/types/learn'

import { REPORT_REASONS } from './learn-utils'

const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS.map((reason) => reason.id) as [string, ...string[]], {
    error: 'Choisissez un motif.',
  }),
  description: z.string().trim().max(500, '500 caractères au maximum.'),
})

type ReportValues = z.infer<typeof reportSchema>

export interface ReportTarget {
  type: LearnReportTarget
  /** Nom court du contenu signalé, repris dans la feuille. */
  label: string
}

const TARGET_NOUN: Record<LearnReportTarget, string> = {
  post: 'cette publication',
  comment: 'ce commentaire',
  document: 'ce document',
  user: 'cet utilisateur',
}

interface ReportSheetProps {
  target: ReportTarget | null
  onClose: () => void
}

/** Signalement d'un contenu. Le serveur le transmet aux modérateurs ; ici, rien n'est envoyé. */
export function ReportSheet({ target, onClose }: ReportSheetProps) {
  return (
    <BottomSheet
      open={target !== null}
      onClose={onClose}
      title="Signaler"
      {...(target ? { subtitle: target.label } : {})}
    >
      {target ? <ReportForm target={target} onClose={onClose} /> : null}
    </BottomSheet>
  )
}

function ReportForm({ target, onClose }: { target: ReportTarget; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { description: '' },
  })

  if (sent) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-xl bg-muted p-4 text-body">
          Signalement enregistré. Les modérateurs examineront{' '}
          {TARGET_NOUN[target.type]}.
        </p>
        <Button type="button" className="w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(() => setSent(true))(event)}
      noValidate
      className="space-y-4"
    >
      <fieldset className="space-y-2">
        <legend className="mb-1 text-body font-semibold">
          Pourquoi signalez-vous {TARGET_NOUN[target.type]} ?
        </legend>
        {REPORT_REASONS.map((reason) => (
          <label
            key={reason.id}
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 text-body',
              'has-checked:border-brand has-checked:bg-accent',
            )}
          >
            <input
              type="radio"
              value={reason.id}
              aria-describedby={errors.reason ? 'report-reason-error' : undefined}
              className="size-5 accent-(--brand)"
              {...register('reason')}
            />
            {reason.label}
          </label>
        ))}
        {errors.reason ? (
          <p
            id="report-reason-error"
            role="alert"
            className="text-caption font-medium text-danger"
          >
            {errors.reason.message}
          </p>
        ) : null}
      </fieldset>

      <Field
        id="report-description"
        label="Précisions"
        optional
        error={errors.description?.message}
      >
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            placeholder="Ce qui pose problème, en quelques mots"
            {...register('description')}
          />
        )}
      </Field>

      <Button type="submit" className="w-full">
        Envoyer le signalement
      </Button>
    </form>
  )
}
