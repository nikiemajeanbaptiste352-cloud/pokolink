import { CircleCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Confirmation visuelle d'une action (lue par les lecteurs d'écran). */
export function FlashMessage({ message }: { message: string }) {
  return (
    <div role="status" className="empty:hidden">
      {message ? (
        <p className="mx-4 flex animate-in items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-body font-semibold text-primary-foreground shadow-[0_12px_28px_-18px_var(--primary)] fade-in">
          <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : null}
    </div>
  )
}

/** En-tête de rubrique : titre, sous-titre et action principale. */
export function ToolHeading({
  title,
  subtitle,
  action,
  icon: Icon,
  eyebrow,
  progress,
}: {
  title: string
  subtitle: string
  action?: ReactNode
  icon?: LucideIcon
  /** Petite ligne au-dessus du titre (ex. « Rubrique »). */
  eyebrow?: string
  /** Avancement 0–100 affiché sous le sous-titre. */
  progress?: number
}) {
  const meter = progress == null ? null : Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <div className="relative overflow-hidden border-b border-border/60 bg-card/70 px-4 py-4 backdrop-blur-xl sm:px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,color-mix(in_srgb,var(--primary)_12%,transparent)_0%,transparent_60%)]"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-border/70 bg-background/80 text-primary shadow-sm ring-1 ring-primary/10">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="truncate text-headline font-extrabold tracking-tight">{title}</h2>
            <p className="truncate text-body text-muted-foreground">{subtitle}</p>
            {meter == null ? null : (
              <div className="mt-2.5 flex max-w-xs items-center gap-2">
                <span
                  role="meter"
                  aria-label="Avancement de la rubrique"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={meter}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${meter}%` }}
                  />
                </span>
                <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                  {meter} %
                </span>
              </div>
            )}
          </div>
        </div>
        {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
      </div>
    </div>
  )
}

/** Une statistique : valeur en gras et libellé. */
export function StatTile({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border border-border/70 bg-card/95 p-3.5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]',
        className,
      )}
    >
      <dd className="truncate text-headline font-extrabold tracking-tight tabular-nums">
        {value}
      </dd>
      <dt className="mt-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
    </div>
  )
}

/** Pastille de statut lisible : fond neutre, texte foncé. */
export function StatusPill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-lg border border-border/60 bg-muted/80 px-2.5 py-1 text-caption font-bold',
        className,
      )}
    >
      {children}
    </span>
  )
}
