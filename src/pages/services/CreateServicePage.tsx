import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { CreationStep } from '@/components/services/config/CreationStep'
import { WizardFrame } from '@/components/services/config/WizardFrame'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/use-services'
import { createServiceSchema, type CreateServiceValues } from '@/lib/service-schemas'
import { paths } from '@/routes/paths'

/**
 * Étape 1 sur 8 : type d'activité et nom. À la validation le brouillon est créé et
 * l'assistant de configuration s'ouvre sur l'étape 2.
 */
export function CreateServicePage() {
  const navigate = useNavigate()
  const { createService } = useServices()
  const form = useForm<CreateServiceValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { name: '' },
  })

  function onSubmit(values: CreateServiceValues) {
    const id = createService(values)
    void navigate(paths.serviceSettings(id), { replace: true })
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} noValidate>
        <WizardFrame step={0} backTo={paths.profile} closeTo={paths.profile}>
          <CreationStep />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            Continuer
          </Button>
        </WizardFrame>
      </form>
    </FormProvider>
  )
}
