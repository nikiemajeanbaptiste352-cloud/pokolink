import { Navigate, useParams } from 'react-router-dom'

import { useAfriLearnCommerce } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  canManageCanal,
  findCanal,
  hasCanalMemberAccess,
} from '@/lib/afrilearn-commerce-store'
import { LEARN_CANAL_MEMBER_PLAN_DEFAULT } from '@/lib/afrilearn-plans'
import { paths } from '@/routes/paths'

/**
 * Raccourci « S’abonner » :
 * - forfait par défaut → paiement Wallet
 * - déjà abonné / propriétaire → accès canal
 * - canal indisponible → marché
 */
export function LearnCanalSubscribePage() {
  useAfriLearnCommerce()
  const { canalId } = useParams()
  const profile = useProfile()

  if (!canalId) return <Navigate to={paths.learnMarket} replace />

  const canal = findCanal(canalId)
  if (!canal || !canal.published || !canManageCanal(canal.ownerHandle)) {
    return <Navigate to={paths.learnMarket} replace />
  }

  const me = profile.handle.replace(/^@/, '').toLowerCase()
  const isOwner = canal.ownerHandle.toLowerCase() === me
  if (isOwner || hasCanalMemberAccess(canal.id, profile.handle)) {
    return <Navigate to={paths.learnCanalAccess(canal.id)} replace />
  }

  if (!canal.memberPlansEnabled) {
    return <Navigate to={paths.learnCanalPublic(canal.id)} replace />
  }

  return (
    <Navigate
      to={paths.learnCanalMemberPay(canal.id, LEARN_CANAL_MEMBER_PLAN_DEFAULT)}
      replace
    />
  )
}
