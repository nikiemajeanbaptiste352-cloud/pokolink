import { Navigate, useParams } from 'react-router-dom'

import { paths } from '@/routes/paths'

/**
 * Ancienne URL détail : redirige vers le fil Market Event + panneau (`?evenement=`).
 */
export function EventParticipationPage() {
  const { eventId } = useParams()
  if (!eventId) return <Navigate to={paths.events} replace />
  return <Navigate to={paths.eventDetail(eventId)} replace />
}
