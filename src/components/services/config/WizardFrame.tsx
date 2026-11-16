import { ArrowLeft, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { Button, buttonVariants } from '@/components/ui/button'

import { WIZARD_STEPS } from './steps'

interface WizardFrameProps {
  /** Étape affichée, de 0 à 7. */
  step: number
  /** Retour à l'étape précédente ; sinon le bouton mène à `backTo`. */
  onBack?: () => void
  backTo: string
  /** Destination du bouton de fermeture (la progression est conservée). */
  closeTo: string
  children: ReactNode
}

/**
 * Cadre commun des 8 étapes de création : en-tête (retour, titre, fermer),
 * barre de progression « Étape n sur 8 » et phrase d'introduction.
 */
export function WizardFrame({
  step,
  onBack,
  backTo,
  closeTo,
  children,
}: WizardFrameProps) {
  const current = WIZARD_STEPS[step]
  const total = WIZARD_STEPS.length
  const label = `Étape ${step + 1} sur ${total}`

  return (
    <>
      <PageHeader
        title={current?.title ?? 'Créer un service'}
        leading={
          onBack ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Étape précédente"
              onClick={onBack}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
          ) : (
            <BackLink to={backTo} label="Profil" />
          )
        }
        actions={
          <Link
            to={closeTo}
            aria-label="Fermer : votre progression est conservée"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <X className="size-5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="border-b bg-background px-4 pt-3 pb-2">
        <div
          role="progressbar"
          aria-label="Progression de la création"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          aria-valuetext={label}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-caption text-muted-foreground">{label}</p>
      </div>

      <div className="space-y-6 px-4 py-6">
        <p className="text-body text-muted-foreground">{current?.intro}</p>
        {children}
      </div>
    </>
  )
}
