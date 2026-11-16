import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Texte secondaire sous le titre. */
  subtitle?: string
  children: ReactNode
}

/**
 * Feuille ancrée en bas de l'écran. Basée sur `<dialog>` : piège du focus, touche Échap
 * et fond bloquant sont natifs. Le contenu n'est monté que quand la feuille est ouverte,
 * donc un formulaire repart toujours vide.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') ref.current?.close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close()
      }}
      className={cn(
        'fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[92dvh] w-full max-w-180 overflow-y-auto',
        'rounded-t-3xl bg-background p-0 text-foreground backdrop:bg-black/60',
      )}
    >
      {open ? (
        <div className="pb-safe space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-title font-extrabold">{title}</h2>
              {subtitle ? (
                <p className="text-body text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Fermer"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}
