import type { OpeningHours } from '@/types/service'

export interface OpenStatus {
  open: boolean
  /** Ex. « Ouvert · jusqu’à 18:00 » ou « Fermé aujourd’hui ». */
  label: string
}

/** Index de jour utilisé par les horaires : 0 = lundi … 6 = dimanche. */
export function getDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Indique si l'établissement est ouvert à `now`, d'après ses horaires déclarés. */
export function getOpenStatus(hours: readonly OpeningHours[], now: Date): OpenStatus {
  const today = hours.find((h) => h.day === getDayIndex(now))
  if (!today || !today.open) return { open: false, label: 'Fermé aujourd’hui' }

  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  // Horaires de nuit (ex. 20:00 → 02:00) : la fermeture est « le lendemain ».
  const overnight = today.to <= today.from
  const isOpen = overnight
    ? time >= today.from || time < today.to
    : time >= today.from && time < today.to

  if (isOpen) return { open: true, label: `Ouvert · jusqu’à ${today.to}` }
  if (time < today.from) return { open: false, label: `Fermé · ouvre à ${today.from}` }
  return { open: false, label: 'Fermé' }
}
