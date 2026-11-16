import { useEffect, useMemo, useSyncExternalStore } from 'react'

import {
  ensureDemoAffiliateProgram,
  getAffiliateMemberships,
  getAffiliatePrograms,
  subscribeAffiliate,
} from '@/lib/affiliate-store'
import {
  buildEmptyVendorStats,
  buildVendorStatsFromMembers,
} from '@/lib/placeholder-affiliate'
import type {
  AffiliateMembership,
  AffiliateProgram,
  AffiliateVendorStats,
} from '@/types/affiliate'

const EMPTY_MEMBERS: readonly AffiliateMembership[] = []
const EMPTY_STATS = buildEmptyVendorStats()

function useAffiliateSnapshot() {
  const programs = useSyncExternalStore(
    subscribeAffiliate,
    getAffiliatePrograms,
  )
  const memberships = useSyncExternalStore(
    subscribeAffiliate,
    getAffiliateMemberships,
  )
  return { programs, memberships }
}

export function useAffiliatePrograms(
  serviceId: string,
): readonly AffiliateProgram[] {
  useEffect(() => {
    ensureDemoAffiliateProgram(serviceId)
  }, [serviceId])

  const { programs } = useAffiliateSnapshot()
  return useMemo(
    () => programs.filter((p) => p.serviceId === serviceId),
    [programs, serviceId],
  )
}

export function useAffiliateProgram(
  serviceId: string,
  programId: string | undefined,
): AffiliateProgram | undefined {
  const programs = useAffiliatePrograms(serviceId)
  return useMemo(
    () => programs.find((p) => p.id === programId),
    [programs, programId],
  )
}

export function useProgramMemberships(
  programId: string | undefined,
): readonly AffiliateMembership[] {
  const { memberships } = useAffiliateSnapshot()
  return useMemo(() => {
    if (!programId) return EMPTY_MEMBERS
    return memberships.filter((m) => m.programId === programId)
  }, [memberships, programId])
}

export function useVendorAffiliateStats(
  programId: string | undefined,
): AffiliateVendorStats {
  const members = useProgramMemberships(programId)
  return useMemo(() => {
    if (!programId) return EMPTY_STATS
    return buildVendorStatsFromMembers(members)
  }, [programId, members])
}

export function useAllAffiliateMemberships(): readonly AffiliateMembership[] {
  return useSyncExternalStore(subscribeAffiliate, getAffiliateMemberships)
}

export function usePublishedAffiliatePrograms(): readonly AffiliateProgram[] {
  const { programs } = useAffiliateSnapshot()
  return useMemo(
    () => programs.filter((p) => p.status === 'published'),
    [programs],
  )
}

export function usePublishedProgramsForService(
  serviceId: string,
): readonly AffiliateProgram[] {
  const programs = useAffiliatePrograms(serviceId)
  return useMemo(
    () => programs.filter((p) => p.status === 'published'),
    [programs],
  )
}

export function useMyAffiliateMemberships(
  handle: string,
): readonly AffiliateMembership[] {
  const { memberships } = useAffiliateSnapshot()
  const clean = handle.replace(/^@/, '')
  return useMemo(
    () => memberships.filter((m) => m.affiliateHandle === clean),
    [memberships, clean],
  )
}

export function useMyProgramMembership(
  programId: string | undefined,
  handle: string,
): AffiliateMembership | undefined {
  const mine = useMyAffiliateMemberships(handle)
  return useMemo(
    () => (programId ? mine.find((m) => m.programId === programId) : undefined),
    [mine, programId],
  )
}
