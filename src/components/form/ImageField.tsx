import { ImagePlus, Trash2, type LucideIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { Media } from '@/components/common/Media'
import { Button } from '@/components/ui/button'
import { readImageAsDataUrl } from '@/lib/image'
import type { Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'

interface ImageFieldProps {
  label: string
  /** Data URL actuelle, chaîne vide si aucune image. */
  value: string
  onChange: (value: string) => void
  /** Icône du visuel provisoire. */
  icon: LucideIcon
  tone?: Tone
  /** Côté le plus long de l'image enregistrée, en pixels. */
  maxSize?: number
  /** Forme de l'aperçu. */
  shape?: 'round' | 'square' | 'wide'
  hint?: string
}

const shapes = {
  round: 'size-24 rounded-full',
  square: 'size-24 rounded-xl',
  wide: 'h-24 w-36 rounded-xl',
} as const

/** Choix d'une image (logo, photo d'un article) avec aperçu, remplacement et retrait. */
export function ImageField({
  label,
  value,
  onChange,
  icon,
  tone = 'neutral',
  maxSize = 512,
  shape = 'square',
  hint,
}: ImageFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(undefined)
    try {
      onChange(await readImageAsDataUrl(file, maxSize))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image invalide.')
    }
  }

  return (
    <div className="space-y-1.5">
      <span id={`${inputId}-label`} className="block text-body font-semibold">
        {label}
        <span className="font-normal text-muted-foreground"> (facultatif)</span>
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <Media
          src={value || undefined}
          alt={value ? label : ''}
          icon={icon}
          tone={tone}
          className={cn('shrink-0 border', shapes[shape])}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <ImagePlus aria-hidden="true" />
            {value ? 'Changer' : 'Choisir une image'}
          </Button>
          {value ? (
            <Button variant="ghost" onClick={() => onChange('')}>
              <Trash2 aria-hidden="true" />
              Retirer
              <span className="sr-only"> : {label}</span>
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          aria-labelledby={`${inputId}-label`}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            // Permet de rechoisir le même fichier après l'avoir retiré.
            event.target.value = ''
          }}
        />
      </div>
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
