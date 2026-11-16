import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { Field } from '@/components/form/Field'
import { SwitchRow } from '@/components/form/SwitchRow'
import { PageHeader } from '@/components/common/PageHeader'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import {
  useOwnerCanal,
  useOwnerCanalSubscription,
} from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import {
  canManageCanal,
  listCanalMemberSubscribers,
  upsertCanalPro,
} from '@/lib/afrilearn-commerce-store'
import {
  formatPlanDuration,
  LEARN_CANAL_MEMBER_PLANS,
  memberPlanPrice,
} from '@/lib/afrilearn-plans'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { LearnCanalMemberPlanId } from '@/types/afrilearn-commerce'

/** Formulaire création / édition Canal Pro (après abonnement actif). */
export function LearnCanalManagePage() {
  const profile = useProfile()
  const sub = useOwnerCanalSubscription(profile.handle)
  const canal = useOwnerCanal(profile.handle)
  const active = canManageCanal(profile.handle)

  const [params] = useSearchParams()
  const justPaid = params.get('paye') === '1'
  const ticketId = params.get('ticket')
  const [name, setName] = useState(canal?.name ?? '')
  const [tagline, setTagline] = useState(canal?.tagline ?? '')
  const [description, setDescription] = useState(canal?.description ?? '')
  const [published, setPublished] = useState(canal?.published ?? false)
  const [memberPlansEnabled, setMemberPlansEnabled] = useState(
    canal?.memberPlansEnabled ?? true,
  )
  const [prices, setPrices] = useState<
    Partial<Record<LearnCanalMemberPlanId, string>>
  >(() => {
    const init: Partial<Record<LearnCanalMemberPlanId, string>> = {}
    for (const plan of LEARN_CANAL_MEMBER_PLANS) {
      const p = canal
        ? memberPlanPrice(canal, plan.id)
        : plan.defaultPrice
      init[plan.id] = String(p)
    }
    return init
  })
  const [saved, setSaved] = useState(false)

  const subscribers = canal ? listCanalMemberSubscribers(canal.id) : []

  if (!sub || !active) {
    return <Navigate to={paths.learnCanalPlans} replace />
  }

  function parsePrice(raw: string | undefined, fallback: number): number {
    const n = Number(String(raw ?? '').replace(/\s/g, ''))
    if (!Number.isFinite(n) || n < 0) return fallback
    return Math.floor(n)
  }

  function save() {
    if (name.trim().length < 2) return
    const memberPlanPrices: Partial<Record<LearnCanalMemberPlanId, number>> = {}
    for (const plan of LEARN_CANAL_MEMBER_PLANS) {
      memberPlanPrices[plan.id] = parsePrice(prices[plan.id], plan.defaultPrice)
    }
    upsertCanalPro({
      ...(canal ? { id: canal.id } : {}),
      ownerHandle: profile.handle,
      subscriptionId: sub!.id,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      logo: canal?.logo ?? '',
      cover: canal?.cover ?? '',
      published,
      memberPlansEnabled,
      memberPlanPrices,
    })
    setSaved(true)
  }

  return (
    <>
      <PageHeader
        title={canal ? 'Mon Canal Pro' : 'Personnaliser mon Canal Pro'}
        leading={<BackLink to={paths.learnMine} label="Mon AfriLearn" history />}
      />
      <div className="space-y-4 px-4 pb-10">
        {justPaid ? (
          <p
            role="status"
            className="rounded-2xl border border-brand/30 bg-brand/5 px-3.5 py-3 text-[13px] font-semibold text-brand"
          >
            Paiement Wallet confirmé — abonnement Canal Pro activé.
            {ticketId ? (
              <>
                {' '}
                <Link
                  to={paths.ticket(ticketId)}
                  className="underline underline-offset-2"
                >
                  Ticket
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        <Field id="canal-name" label="Nom du canal">
          {(a11y) => (
            <Input
              {...a11y}
              value={name}
              maxLength={60}
              onChange={(e) => {
                setName(e.target.value)
                setSaved(false)
              }}
              placeholder="Ex. Maths Terminale Dakar"
            />
          )}
        </Field>
        <Field id="canal-tagline" label="Accroche" optional>
          {(a11y) => (
            <Input
              {...a11y}
              value={tagline}
              maxLength={100}
              onChange={(e) => {
                setTagline(e.target.value)
                setSaved(false)
              }}
            />
          )}
        </Field>
        <Field id="canal-desc" label="Présentation" optional>
          {(a11y) => (
            <Textarea
              {...a11y}
              value={description}
              maxLength={500}
              rows={4}
              onChange={(e) => {
                setDescription(e.target.value)
                setSaved(false)
              }}
            />
          )}
        </Field>

        <div className="rounded-xl border bg-card px-3 shadow-card">
          <SwitchRow
            label="Publier le canal"
            description="Visible sur le marché éducatif AfriLearn"
            checked={published}
            onCheckedChange={(v) => {
              setPublished(v)
              setSaved(false)
            }}
          />
        </div>

        <section className="space-y-3">
          <h2 className="text-body font-extrabold">Forfaits abonnés visiteurs</h2>
          <p className="text-caption text-muted-foreground">
            Proposez Mensuel, Trimestriel et Annuel. Les visiteurs paient avec le
            Wallet AfriConnect.
          </p>
          <div className="rounded-xl border bg-card px-3 shadow-card">
            <SwitchRow
              label="Activer les abonnements"
              description="Afficher les forfaits sur la page publique"
              checked={memberPlansEnabled}
              onCheckedChange={(v) => {
                setMemberPlansEnabled(v)
                setSaved(false)
              }}
            />
          </div>
          {memberPlansEnabled ? (
            <ul className="space-y-3">
              {LEARN_CANAL_MEMBER_PLANS.map((plan) => (
                <li
                  key={plan.id}
                  className="space-y-2 rounded-2xl border bg-card p-3.5 shadow-card"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-extrabold">{plan.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPlanDuration(plan.durationDays)}
                    </p>
                  </div>
                  <Field
                    id={`price-${plan.id}`}
                    label={`Prix (FCFA) · défaut ${formatPrice(plan.defaultPrice)}`}
                  >
                    {(a11y) => (
                      <Input
                        {...a11y}
                        inputMode="numeric"
                        value={prices[plan.id] ?? ''}
                        onChange={(e) => {
                          setPrices((prev) => ({
                            ...prev,
                            [plan.id]: e.target.value,
                          }))
                          setSaved(false)
                        }}
                      />
                    )}
                  </Field>
                </li>
              ))}
            </ul>
          ) : null}
          {subscribers.length > 0 ? (
            <p className="text-caption text-muted-foreground">
              {subscribers.length} abonné
              {subscribers.length > 1 ? 's' : ''} actif
              {subscribers.length > 1 ? 's' : ''}
            </p>
          ) : null}
        </section>

        <Button type="button" size="lg" className="w-full" onClick={save}>
          Enregistrer
        </Button>
        {saved ? (
          <p role="status" className="text-center text-caption font-semibold text-brand">
            Canal enregistré.
          </p>
        ) : null}

        {canal?.published ? (
          <Link
            to={paths.learnCanalPublic(canal.id)}
            className={buttonVariants({ variant: 'outline', className: 'w-full' })}
          >
            Voir la page publique
          </Link>
        ) : null}
      </div>
    </>
  )
}
