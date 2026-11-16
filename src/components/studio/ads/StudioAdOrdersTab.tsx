import {
  Check,
  ClipboardList,
  MessageCircle,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { StatusPill } from '@/components/pro/shared'
import { StudioSection } from '@/components/studio/parts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { useStartConversation } from '@/hooks/use-conversations'
import { useProfile } from '@/hooks/use-profile'
import { useStudioAdOrders } from '@/hooks/use-studio-ads'
import { formatPrice } from '@/lib/format'
import {
  advertiserRecipient,
  creatorAdPlanContext,
} from '@/lib/messaging-contexts'
import { formatDateTime } from '@/lib/pro-labels'
import {
  STUDIO_AD_ORDER_STATUS_LABEL,
  STUDIO_AD_REQUEST_KIND_LABEL,
} from '@/lib/studio-ads-labels'
import { updateStudioAdOrderStatus } from '@/lib/studio-ads-store'
import type { StudioAdOrder, StudioAdOrderStatus } from '@/types/studio-ads'

type OrderFilter = 'all' | 'orders' | 'quotes' | StudioAdOrderStatus

const FILTERS: readonly { id: OrderFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'orders', label: 'Commandes' },
  { id: 'quotes', label: 'Devis' },
  { id: 'pending', label: 'En attente' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'completed', label: 'Terminées' },
]

function matches(order: StudioAdOrder, filter: OrderFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'orders') return order.kind === 'order'
  if (filter === 'quotes') return order.kind === 'quote'
  return order.status === filter
}

/**
 * Rubrique privée « Commandes publicitaires » — gestion des commandes et devis.
 */
export function StudioAdOrdersTab() {
  const orders = useStudioAdOrders()
  const profile = useProfile()
  const startConversation = useStartConversation()
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const visible = useMemo(
    () => orders.filter((o) => matches(o, filter)),
    [orders, filter],
  )
  const opened = orders.find((o) => o.id === openId) ?? null

  function act(status: StudioAdOrderStatus, withNote = false) {
    if (!opened) return
    updateStudioAdOrderStatus(
      opened.id,
      status,
      withNote ? note.trim() || undefined : undefined,
    )
    setNote('')
    setOpenId(null)
  }

  function contactAdvertiser(order: StudioAdOrder) {
    if (!order.advertiserHandle) return
    startConversation({
      recipient: advertiserRecipient({
        handle: order.advertiserHandle,
        name: order.advertiserName,
      }),
      context: creatorAdPlanContext(
        { handle: profile.handle, name: profile.name },
        { id: order.planId, name: order.planName },
      ),
    })
  }

  return (
    <>
      <StudioSection
        title="Commandes publicitaires"
        description="Commandes reçues depuis votre page publique."
      >
        <FilterChips
          label="Filtrer"
          items={FILTERS}
          value={filter}
          onChange={setFilter}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucune commande"
            description="Les commandes et devis liés à vos forfaits apparaîtront ici."
            className="py-10"
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucun résultat"
            description="Rien à afficher pour ce filtre."
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(order.id)
                    setNote(order.note ?? '')
                  }}
                  className="flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 text-left shadow-card transition-colors hover:bg-muted/40"
                >
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-caption font-bold">
                      {order.number}
                    </span>
                    <StatusPill>
                      {STUDIO_AD_ORDER_STATUS_LABEL[order.status]}
                    </StatusPill>
                  </span>
                  <span className="text-body font-extrabold">{order.advertiserName}</span>
                  <span className="text-caption text-muted-foreground">
                    {STUDIO_AD_REQUEST_KIND_LABEL[order.kind]} · {order.planName}
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted-foreground">
                    <span>
                      {order.acceptedPrice === null
                        ? 'Sur devis'
                        : formatPrice(order.acceptedPrice)}
                    </span>
                    <span>{formatDateTime(order.orderedAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </StudioSection>

      <BottomSheet
        open={opened !== null}
        onClose={() => setOpenId(null)}
        title={opened?.number ?? 'Commande'}
        subtitle={
          opened
            ? `${STUDIO_AD_REQUEST_KIND_LABEL[opened.kind]} · ${opened.planName}`
            : undefined
        }
      >
        {opened ? (
          <div className="space-y-4">
            <dl className="divide-y rounded-2xl border bg-card px-4">
              <Row label="Annonceur" value={opened.advertiserName} />
              <Row
                label="Identifiant"
                value={
                  opened.advertiserHandle ? `@${opened.advertiserHandle}` : '—'
                }
              />
              <Row label="Forfait" value={opened.planName} />
              <Row
                label="Prix accepté"
                value={
                  opened.acceptedPrice === null
                    ? 'Sur devis'
                    : formatPrice(opened.acceptedPrice)
                }
              />
              <Row label="Commande" value={formatDateTime(opened.orderedAt)} />
              <Row
                label="Réalisation souhaitée"
                value={
                  opened.desiredAt ? formatDateTime(opened.desiredAt) : '—'
                }
              />
              <Row
                label="Statut"
                value={STUDIO_AD_ORDER_STATUS_LABEL[opened.status]}
              />
            </dl>

            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-muted-foreground">
                Description de la campagne
              </p>
              <p className="rounded-xl bg-muted p-3 text-body">{opened.campaignBrief}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-muted-foreground">
                Note / motif
              </p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Motif de refus, précision demandée, avancement…"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {opened.status === 'pending' || opened.status === 'needs_info' ? (
                <>
                  <Button type="button" onClick={() => act('accepted')}>
                    <Check aria-hidden="true" />
                    Accepter
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => act('refused', true)}
                  >
                    <X aria-hidden="true" />
                    Refuser
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => act('needs_info', true)}
                  >
                    <MoreHorizontal aria-hidden="true" />
                    Demander des précisions
                  </Button>
                </>
              ) : null}
              {opened.status === 'accepted' ? (
                <Button type="button" onClick={() => act('in_progress', true)}>
                  Mettre en cours
                </Button>
              ) : null}
              {opened.status === 'in_progress' ? (
                <Button type="button" onClick={() => act('completed', true)}>
                  Déclarer terminée
                </Button>
              ) : null}
              {opened.advertiserHandle ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => contactAdvertiser(opened)}
                >
                  <MessageCircle aria-hidden="true" />
                  Contacter l’annonceur
                </Button>
              ) : (
                <p className="col-span-full text-caption text-muted-foreground">
                  Contact : utilisez Messagerie lorsque l’annonceur a un identifiant.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-body font-semibold break-words">{value}</dd>
    </div>
  )
}
