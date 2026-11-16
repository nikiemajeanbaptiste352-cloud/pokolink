import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { getServiceTypeMeta } from '@/lib/service-types'
import type { Service } from '@/types/service'

/**
 * Accueil Service Pro (privé ou public) — délègue à ProfileWelcome.
 */
export function DashboardWelcome({
  service,
  variant = 'private',
  onDone,
}: {
  service: Service
  variant?: 'private' | 'public'
  onDone?: () => void
}) {
  const meta = getServiceTypeMeta(service.type)
  const subtitle =
    variant === 'public' && service.welcomeMessage.trim()
      ? service.welcomeMessage.trim()
      : [meta.label, service.city].filter(Boolean).join(' · ')

  return (
    <ProfileWelcome
      name={service.name}
      eyebrow={variant === 'public' ? 'Service Pro' : 'Espace Pro'}
      subtitle={subtitle || undefined}
      avatarSrc={service.logo || undefined}
      icon={meta.icon}
      accentId={service.accent}
      onDone={onDone}
    />
  )
}
