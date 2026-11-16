import { useMemo, type ReactNode } from 'react'

import { ToolHeading } from '@/components/pro/shared'
import { useAdCampaigns } from '@/hooks/use-ad-campaigns'
import { useCurrentService } from '@/hooks/use-current-service'
import { useProExtras } from '@/hooks/use-pro-extras'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { useServiceItems } from '@/hooks/use-services'
import { getRubriqueStats } from '@/lib/service-rubrique-stats'
import { getServiceTool } from '@/lib/service-tools'
import { cn } from '@/lib/utils'
import type { ServiceToolId } from '@/types/service'

/**
 * Cadre professionnel commun à chaque rubrique de l’Espace Pro :
 * en-tête (icône, titre, avancement) + contenu inchangé.
 */
export function RubriquePage({
  toolId,
  title,
  subtitle,
  action,
  children,
  className,
  showProgress = true,
}: {
  toolId: ServiceToolId
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  showProgress?: boolean
}) {
  const service = useCurrentService()
  const tool = getServiceTool(toolId)
  const items = useServiceItems(service.id)
  const orders = useServiceOrders(service)
  const { data: extras } = useProExtras(service)
  const campaigns = useAdCampaigns(service.id)

  const progress = useMemo(() => {
    if (!showProgress || toolId === 'dashboard' || toolId === 'notifications') {
      return undefined
    }
    const stats = getRubriqueStats({ service, items, orders, extras, campaigns })
    return stats.find((s) => s.id === toolId)?.progress
  }, [showProgress, toolId, service, items, orders, extras, campaigns])

  return (
    <section className={cn('space-y-4 pb-8', className)}>
      <ToolHeading
        icon={tool.icon}
        eyebrow="Rubrique"
        title={title ?? tool.label}
        subtitle={subtitle ?? `${tool.description} · ${service.name}`}
        action={action}
        progress={progress}
      />
      {children}
    </section>
  )
}
