import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { FormProvider, useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { FilterChips } from '@/components/common/FilterChips'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/use-services'
import { accentStyle } from '@/lib/service-accents'
import { serviceConfigSchema, type ServiceConfigValues } from '@/lib/service-schemas'
import { getServiceTypeMeta } from '@/lib/service-types'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

import { BusinessStep } from './BusinessStep'
import { ContactsStep } from './ContactsStep'
import { CreationStep } from './CreationStep'
import { IdentityStep } from './IdentityStep'
import { LocationStep } from './LocationStep'
import { PaymentsStep } from './PaymentsStep'
import { PersonalizationStep } from './PersonalizationStep'
import { ReviewStep } from './ReviewStep'
import { LAST_STEP, WIZARD_STEPS } from './steps'
import { WizardFrame } from './WizardFrame'

interface ServiceConfigWizardProps {
  service: Service
  /** Étape ouverte au départ (0 à 7). */
  initialStep?: number
}

const USERNAME_TAKEN = 'Ce nom d’utilisateur est déjà pris'

/** Ne garde que les réponses des champs métier du type d'activité choisi. */
function cleanValues(values: ServiceConfigValues): ServiceConfigValues {
  const allowed = new Set(getServiceTypeMeta(values.type).businessFields.map((f) => f.id))
  return {
    ...values,
    businessDetails: Object.fromEntries(
      Object.entries(values.businessDetails).filter(([key]) => allowed.has(key)),
    ),
  }
}

/**
 * Assistant de configuration d'un service en 8 étapes.
 * - Brouillon : plein écran (retour, titre, fermer, progression), la progression est
 *   enregistrée à chaque étape ; la dernière étape génère l'espace professionnel.
 * - Service actif : mêmes écrans pour modifier, avec navigation libre entre les étapes.
 */
export function ServiceConfigWizard({
  service,
  initialStep = 0,
}: ServiceConfigWizardProps) {
  const navigate = useNavigate()
  const { services, updateService } = useServices()
  const isDraft = service.status === 'draft'
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), LAST_STEP))
  const [saved, setSaved] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  const form = useForm<ServiceConfigValues>({
    resolver: zodResolver(serviceConfigSchema),
    // Les étapes sont validées par `trigger` (pas par un submit) : sans ce mode,
    // une erreur resterait affichée même après correction du champ.
    mode: 'onTouched',
    defaultValues: {
      type: service.type,
      name: service.name,
      logo: service.logo,
      cover: service.cover,
      description: service.description,
      country: service.country,
      city: service.city,
      address: service.address,
      latitude: service.latitude,
      longitude: service.longitude,
      contacts: service.contacts,
      businessDetails: service.businessDetails,
      hours: service.hours,
      paymentMethods: service.paymentMethods,
      allowMerchantCredit: service.allowMerchantCredit ?? false,
      ticket: service.ticket,
      accent: service.accent,
      username: service.username,
      welcomeMessage: service.welcomeMessage,
    },
  })
  const { trigger, getValues, handleSubmit, setError } = form
  // Aperçu en direct : la couleur choisie à l'étape 7 s'applique tout de suite à l'assistant.
  const accent = useWatch({ control: form.control, name: 'accent' })

  // Au changement d'étape, le focus passe au titre : les lecteurs d'écran l'annoncent.
  useEffect(() => {
    // Pas de focus au premier affichage (ni au double rendu de développement).
    if (previousStep.current === step) return
    previousStep.current = step
    const heading = isDraft
      ? document.querySelector<HTMLElement>('h1')
      : headingRef.current
    heading?.setAttribute('tabindex', '-1')
    // Focus programmatique pour les lecteurs d'écran : pas de contour sur un simple titre.
    if (heading) heading.style.outline = 'none'
    heading?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [step, isDraft])

  function isUsernameTaken(username: string) {
    return services.some((s) => s.id !== service.id && s.username === username)
  }

  async function goTo(target: number) {
    // Avancer exige que l'étape courante soit valide ; reculer est toujours permis.
    if (target > step) {
      const current = WIZARD_STEPS[step]
      const valid = await trigger(current?.fields)
      if (!valid) return
      if (
        current?.fields.includes('username') &&
        isUsernameTaken(getValues('username'))
      ) {
        setError('username', { type: 'validate', message: USERNAME_TAKEN })
        return
      }
      // Sauvegarde de la progression : on peut quitter et reprendre plus tard.
      if (isDraft) {
        updateService(service.id, { ...cleanValues(getValues()), setupStep: target })
      }
    }
    setSaved(false)
    setStep(target)
  }

  function finish(values: ServiceConfigValues) {
    if (isUsernameTaken(values.username)) {
      setError('username', { type: 'validate', message: USERNAME_TAKEN })
      setStep(WIZARD_STEPS.findIndex((s) => s.fields.includes('username')))
      return
    }
    updateService(service.id, {
      ...cleanValues(values),
      status: 'active',
      setupStep: LAST_STEP,
    })
    if (isDraft) {
      void navigate(paths.service(service.id), {
        replace: true,
        state: { welcome: true },
      })
    } else {
      setSaved(true)
    }
  }

  // Un champ invalide dans une étape précédente ramène l'utilisateur à cette étape.
  function onInvalid(errors: FieldErrors<ServiceConfigValues>) {
    const index = WIZARD_STEPS.findIndex((s) =>
      s.fields.some((field) => field.split('.')[0]! in errors),
    )
    if (index >= 0) setStep(index)
  }

  const save = handleSubmit(finish, onInvalid)

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // « Entrée » dans un champ valide l'étape, il ne termine pas la configuration.
    if (step < LAST_STEP) void goTo(step + 1)
    else void save()
  }

  const current = WIZARD_STEPS[step]!
  const isLast = step === LAST_STEP

  const stepContent = (
    <>
      {step === 0 ? (
        <CreationStep lockedType={isDraft ? undefined : service.type} />
      ) : null}
      {step === 1 ? <IdentityStep /> : null}
      {step === 2 ? <LocationStep /> : null}
      {step === 3 ? <ContactsStep /> : null}
      {step === 4 ? <BusinessStep /> : null}
      {step === 5 ? <PaymentsStep /> : null}
      {step === 6 ? <PersonalizationStep /> : null}
      {step === 7 ? <ReviewStep isDraft={isDraft} /> : null}

      <div className="flex flex-col gap-3 pt-2">
        {isDraft ? (
          <Button type="submit" size="lg" className="w-full">
            {isLast ? <Check aria-hidden="true" /> : null}
            {isLast ? 'Créer mon espace' : 'Continuer'}
            {isLast ? null : <ArrowRight aria-hidden="true" />}
          </Button>
        ) : (
          <>
            <div className="flex gap-3">
              {step > 0 ? (
                <Button variant="outline" size="lg" onClick={() => void goTo(step - 1)}>
                  <ArrowLeft aria-hidden="true" />
                  Retour
                </Button>
              ) : null}
              {isLast ? null : (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => void goTo(step + 1)}
                >
                  Continuer
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
            </div>
            <Button
              type={isLast ? 'submit' : 'button'}
              size="lg"
              className="w-full"
              onClick={isLast ? undefined : () => void save()}
            >
              <Check aria-hidden="true" />
              Enregistrer les modifications
            </Button>
            <p role="status" className="text-center text-body font-semibold text-brand">
              {saved ? 'Modifications enregistrées.' : ''}
            </p>
          </>
        )}
      </div>
    </>
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="service-scope"
        style={accentStyle(accent)}
      >
        {isDraft ? (
          <WizardFrame
            step={step}
            onBack={step > 0 ? () => void goTo(step - 1) : undefined}
            backTo={paths.profile}
            closeTo={paths.proSpaceFor(service.id)}
          >
            {stepContent}
          </WizardFrame>
        ) : (
          <div className="space-y-6 px-4 py-6">
            <div className="-mx-4">
              <FilterChips
                label="Étapes de configuration"
                items={WIZARD_STEPS.map((s, index) => ({
                  id: String(index),
                  label: s.shortLabel,
                }))}
                value={String(step)}
                onChange={(id) => void goTo(Number(id))}
              />
            </div>
            <div className="space-y-1">
              <p className="text-caption font-semibold text-muted-foreground">
                Étape {step + 1} sur {WIZARD_STEPS.length}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-headline font-extrabold outline-none"
              >
                {current.title}
              </h2>
              <p className="text-body text-muted-foreground">{current.intro}</p>
            </div>
            {stepContent}
          </div>
        )}
      </form>
    </FormProvider>
  )
}
