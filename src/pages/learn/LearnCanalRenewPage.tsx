import { Navigate } from 'react-router-dom'

import { useOwnerCanalSubscription } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { paths } from '@/routes/paths'

import { LearnCanalPayPage } from './LearnCanalPayPage'

/** Renouvellement : reprend la formule actuelle, sinon renvoie aux formules. */
export function LearnCanalRenewPage() {
  const profile = useProfile()
  const sub = useOwnerCanalSubscription(profile.handle)
  if (!sub) return <Navigate to={paths.learnCanalPlans} replace />
  return <LearnCanalPayPage key={sub.planId} forcedPlanId={sub.planId} />
}
