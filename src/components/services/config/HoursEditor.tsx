import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { WEEK_DAYS } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import type { OpeningHours } from '@/types/service'

interface HoursEditorProps {
  value: OpeningHours[]
  onChange: (value: OpeningHours[]) => void
  error?: string | undefined
}

const timeClass =
  'h-11 w-full min-w-0 rounded-xl border bg-input px-3 text-base text-foreground disabled:opacity-50'

/** Horaires d'ouverture : une carte par jour, avec interrupteur ouvert / fermé. */
export function HoursEditor({ value, onChange, error }: HoursEditorProps) {
  function update(day: number, patch: Partial<OpeningHours>) {
    onChange(value.map((h) => (h.day === day ? { ...h, ...patch } : h)))
  }

  function copyFirstToAll() {
    const first = value[0]
    if (!first) return
    onChange(
      value.map((h) => ({ ...h, open: first.open, from: first.from, to: first.to })),
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-body font-semibold">Horaires d’ouverture</legend>
      <ul className="space-y-2">
        {value.map((hours) => {
          const dayName = WEEK_DAYS[hours.day] ?? `Jour ${hours.day + 1}`
          return (
            <li key={hours.day} className="rounded-xl border bg-card px-3 shadow-card">
              <div className="flex min-h-12 items-center justify-between gap-3">
                <span className="text-body font-semibold">{dayName}</span>
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-caption font-medium',
                      hours.open ? 'text-brand' : 'text-muted-foreground',
                    )}
                  >
                    {hours.open ? 'Ouvert' : 'Fermé'}
                  </span>
                  <Switch
                    label={`Ouvert le ${dayName.toLowerCase()}`}
                    checked={hours.open}
                    onCheckedChange={(open) => update(hours.day, { open })}
                  />
                </span>
              </div>
              {hours.open ? (
                <div className="grid grid-cols-2 gap-3 pb-3">
                  <label className="space-y-1">
                    <span className="block text-caption text-muted-foreground">
                      Ouverture
                      <span className="sr-only"> le {dayName.toLowerCase()}</span>
                    </span>
                    <input
                      type="time"
                      value={hours.from}
                      onChange={(event) =>
                        update(hours.day, { from: event.target.value })
                      }
                      className={timeClass}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-caption text-muted-foreground">
                      Fermeture
                      <span className="sr-only"> le {dayName.toLowerCase()}</span>
                    </span>
                    <input
                      type="time"
                      value={hours.to}
                      onChange={(event) => update(hours.day, { to: event.target.value })}
                      className={timeClass}
                    />
                  </label>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      <Button variant="outline" size="sm" className="min-h-11" onClick={copyFirstToAll}>
        <Copy aria-hidden="true" />
        Appliquer les horaires du lundi à tous les jours
      </Button>
      {error ? (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
