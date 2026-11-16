/**
 * Préférences de l'application sur cet appareil (notifications, confidentialité d'affichage).
 *
 * STOCKAGE TEMPORAIRE : ces choix restent sur l'appareil. À remplacer par l'API pour les
 * préférences qui doivent suivre le compte. La sécurité (mot de passe, code PIN, vérification
 * d'identité) reste entièrement gérée par le serveur.
 */
import { createLocalStore } from '@/lib/local-store'

export interface AppSettings {
  paymentAlerts: boolean
  messageAlerts: boolean
  eventAlerts: boolean
  offers: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  paymentAlerts: true,
  messageAlerts: true,
  eventAlerts: true,
  offers: false,
}

export const settingsStore = createLocalStore<AppSettings>(
  'africonnect.settings.v1',
  (raw) => {
    const settings = { ...DEFAULT_SETTINGS }
    if (typeof raw !== 'object' || raw === null) return settings
    const record = raw as Record<string, unknown>
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
      if (typeof record[key] === 'boolean') settings[key] = record[key]
    }
    return settings
  },
)

export function updateSetting(key: keyof AppSettings, value: boolean) {
  settingsStore.set({ ...settingsStore.get(), [key]: value })
}
