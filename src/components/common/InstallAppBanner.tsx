import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'africonnect.install-banner.dismissed'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // iOS Safari
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Bannière mobile : installe AfriConnect en mode appli (sans barre Chrome).
 */
export function InstallAppBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    if (isStandalone()) return false
    if (localStorage.getItem(DISMISS_KEY) === '1') return false
    return window.matchMedia('(max-width: 48rem)').matches
  })
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!visible) return

    function onPrompt(event: Event) {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [visible])

  if (!visible) return null

  async function install() {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
      setVisible(false)
      return
    }
    // Fallback : consignes Chrome Android
    window.alert(
      'Pour ouvrir AfriConnect en plein écran :\n\n1. Menu ⋮ de Chrome\n2. « Installer l’application » ou « Ajouter à l’écran d’accueil »\n3. Ouvrez l’icône AfriConnect (sans barre d’adresse)',
    )
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
      <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-lg">
        <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b6b3a] text-white">
          <Download className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Mode application</p>
          <p className="text-caption text-muted-foreground">
            Installez AfriConnect pour le plein écran, sans barre Chrome.
          </p>
          <button
            type="button"
            onClick={() => void install()}
            className="mt-2 inline-flex h-9 items-center rounded-full bg-[#0b6b3a] px-3 text-sm font-bold text-white"
          >
            Installer
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
