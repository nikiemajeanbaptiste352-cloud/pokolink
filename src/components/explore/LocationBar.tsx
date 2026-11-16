import { ChevronDown, MapPin } from 'lucide-react'

interface LocationBarProps {
  /** Ville choisie, `null` = toutes les villes. */
  value: string | null
  cities: readonly string[]
  onChange: (city: string | null) => void
}

const ALL = '__all__'

/**
 * Localisation d'Explorer : la ville dont on découvre les offres. La distance exacte
 * demandera la position de l'appareil, qui n'est pas encore utilisée.
 */
export function LocationBar({ value, cities, onChange }: LocationBarProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary pr-9 pl-3.5 text-body font-semibold text-secondary-foreground focus-within:ring-2 focus-within:ring-ring">
        <MapPin className="size-4.5 shrink-0 text-brand" aria-hidden="true" />
        <span className="sr-only">Ville</span>
        <select
          value={value ?? ALL}
          onChange={(event) =>
            onChange(event.target.value === ALL ? null : event.target.value)
          }
          className="min-h-11 cursor-pointer appearance-none bg-transparent pr-1 font-semibold outline-none"
        >
          <option value={ALL}>Toutes les villes</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </label>
      <p className="min-w-0 text-caption text-muted-foreground">
        Distances : position non activée.
      </p>
    </div>
  )
}
