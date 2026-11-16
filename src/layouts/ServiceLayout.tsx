import { useCallback } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { DashboardWelcome } from '@/components/services/DashboardWelcome'
import { ServiceHeader } from '@/components/services/ServiceHeader'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { ServiceTabs } from '@/components/services/ServiceTabs'
import { useService } from '@/hooks/use-services'
import { accentStyle } from '@/lib/service-accents'
import { paths } from '@/routes/paths'

/**
 * Cadre de l'espace professionnel d'UN service, à ses couleurs.
 * Tant que le service n'est pas configuré (brouillon), seul l'assistant de configuration
 * est accessible : l'espace professionnel est généré à la dernière étape.
 * À la connexion : animation « Bienvenue chez {service} ».
 */
export function ServiceLayout() {
  const { serviceId } = useParams()
  const service = useService(serviceId)
  const location = useLocation()
  const navigate = useNavigate()
  const { pathname } = location
  const clearWelcomeState = useCallback(() => {
    if ((location.state as { welcome?: boolean } | null)?.welcome !== true) return
    navigate(pathname, { replace: true, state: null })
  }, [location.state, navigate, pathname])

  if (!service) {
    return (
      <>
        <PageHeader
          title="Service"
          leading={<BackLink to={paths.proSpace} label="Espace Pro" />}
        />
        <ServiceNotFound backTo={paths.proSpace} />
      </>
    )
  }

  const settingsPath = paths.serviceSettings(service.id)
  const isDraft = service.status === 'draft'
  if (isDraft && pathname !== settingsPath) {
    return <Navigate to={settingsPath} replace />
  }

  return (
    <div
      className="service-scope relative min-h-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_7%,var(--background))_0%,var(--background)_30%)]"
      style={accentStyle(service.accent)}
    >
      {isDraft ? null : (
        <>
          <DashboardWelcome
            service={service}
            variant="private"
            onDone={clearWelcomeState}
          />
          <ServiceHeader service={service} />
          <ServiceTabs serviceId={service.id} />
        </>
      )}
      <Outlet context={service} />
    </div>
  )
}
