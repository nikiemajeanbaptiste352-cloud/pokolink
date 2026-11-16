import { MessageCircle, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import {
  eventContext,
  getHostService,
  proProfilePath,
  proRecipient,
} from '@/lib/messaging-contexts'
import { cn } from '@/lib/utils'
import type { MarketEvent } from '@/types/event'

/**
 * Accès à l'organisateur d'un événement : son profil public et la messagerie centrale, avec
 * l'événement comme contexte. N'affiche rien si l'organisateur n'a pas d'Espace Pro (aucun
 * bouton sans destination).
 */
export function HostActions({
  event,
  className,
}: {
  event: MarketEvent
  className?: string
}) {
  const startConversation = useStartConversation()
  const service = getHostService(event)
  if (!service) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link
        to={proProfilePath(service)}
        className={buttonVariants({ variant: 'outline', className: 'min-w-0 flex-1' })}
      >
        <Store aria-hidden="true" />
        Voir le profil
      </Link>
      <button
        type="button"
        className={buttonVariants({ variant: 'outline', className: 'min-w-0 flex-1' })}
        onClick={() =>
          startConversation({
            recipient: proRecipient(service),
            professionalSpaceId: service.id,
            context: eventContext(event),
          })
        }
      >
        <MessageCircle aria-hidden="true" />
        Message
      </button>
    </div>
  )
}
