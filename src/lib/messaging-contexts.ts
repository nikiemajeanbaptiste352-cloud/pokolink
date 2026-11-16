/**
 * Fabriques des destinataires et des contextes de conversation. Chaque bouton « Message »
 * de l'application passe par ici pour que le destinataire et l'origine soient toujours
 * les bons (cahier des charges, section 9).
 */
import type { StartConversationInput } from '@/lib/conversations-store'
import { findDemoPro } from '@/lib/directory'
import { getEventPath } from '@/lib/event-links'
import { paths } from '@/routes/paths'
import type { MarketEvent } from '@/types/event'
import type { ConversationContext } from '@/types/messages'
import type { CatalogItem, Service } from '@/types/service'

/** Route du profil public d'un établissement. */
export function proProfilePath(service: Service): string {
  return paths.establishment(service.username || service.id)
}

/** Destinataire : l'Espace Pro (son propriétaire), identifié par `professional_space_id`. */
export function proRecipient(service: Service): StartConversationInput['recipient'] {
  return {
    id: `space:${service.id}`,
    name: service.name,
    avatarSrc: service.logo || undefined,
    kind: 'business',
    profileTo: proProfilePath(service),
  }
}

export function profileContext(service: Service): ConversationContext {
  return {
    type: 'professional_profile',
    id: service.id,
    label: service.name,
    to: proProfilePath(service),
  }
}

/** Destinataire : un créateur (page publique `/createur/:handle`). */
export function creatorRecipient(creator: {
  handle: string
  name: string
  avatar?: string | undefined
}): StartConversationInput['recipient'] {
  return {
    id: `user:${creator.handle}`,
    name: creator.name,
    avatarSrc: creator.avatar,
    kind: 'direct',
    profileTo: paths.creator(creator.handle),
  }
}

export function creatorContext(creator: {
  handle: string
  name: string
}): ConversationContext {
  return {
    type: 'creator_content',
    id: creator.handle,
    label: creator.name,
    to: paths.creator(creator.handle),
  }
}

/** Conversation ouverte depuis un forfait publicitaire de la page créateur. */
export function creatorAdPlanContext(
  creator: { handle: string; name: string },
  plan: { id: string; name: string },
): ConversationContext {
  return {
    type: 'creator_content',
    id: plan.id,
    label: `Pub · ${plan.name}`,
    to: paths.creatorAdPlan(creator.handle, plan.id),
  }
}

/** Destinataire annonceur (depuis Commandes publicitaires du Studio). */
export function advertiserRecipient(advertiser: {
  handle: string
  name: string
}): StartConversationInput['recipient'] {
  return {
    id: `user:${advertiser.handle}`,
    name: advertiser.name,
    kind: 'direct',
    profileTo: paths.creator(advertiser.handle),
  }
}

/** Destinataire : un membre d'AfriLearn (page publique `/afrilearn/membre/:handle`). */
export function learnMemberRecipient(member: {
  handle: string
  name: string
}): StartConversationInput['recipient'] {
  return {
    id: `user:${member.handle}`,
    name: member.name,
    kind: 'direct',
    profileTo: paths.learnMember(member.handle),
  }
}

export function learnMemberContext(member: {
  handle: string
  name: string
}): ConversationContext {
  return {
    type: 'user',
    id: member.handle,
    label: member.name,
    to: paths.learnMember(member.handle),
  }
}

export function productContext(item: CatalogItem): ConversationContext {
  return { type: 'product', id: item.id, label: item.name, to: paths.product(item.id) }
}

export function eventContext(event: MarketEvent): ConversationContext {
  return {
    type: 'market_event',
    id: event.id,
    label: event.title,
    to: getEventPath(event.id) ?? paths.events,
  }
}

/** Espace Pro de l'organisateur d'un événement, quand il en a un. */
export function getHostService(event: MarketEvent): Service | undefined {
  const ref = event.host.proRef
  return ref ? findDemoPro(ref)?.service : undefined
}

/**
 * Profil public de l’hôte Market Event (établissement), sinon fil de l’événement.
 * Évite un avatar Accueil sans action.
 */
export function getEventHostProfilePath(event: MarketEvent): string {
  const service = getHostService(event)
  if (service) return proProfilePath(service)
  if (event.host.proRef) return paths.establishment(event.host.proRef)
  return getEventPath(event.id) ?? paths.events
}

/** Libellé de l'origine, pour le bandeau de la conversation. */
export const CONTEXT_LABEL: Record<ConversationContext['type'], string> = {
  product: 'Produit',
  service: 'Service',
  professional_profile: 'Profil professionnel',
  pro_channel: 'Canal',
  market_event: 'Événement',
  creator_content: 'Contenu créateur',
  user: 'Profil',
}
