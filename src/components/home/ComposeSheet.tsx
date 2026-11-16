import { Image as ImageIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { PartnershipLinkField } from '@/components/form/PartnershipLinkField'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { normalizePartnershipLink } from '@/lib/partnership-link'

interface ComposeSheetProps {
  open: boolean
  onClose: () => void
  mode: 'post' | 'story'
  onSubmit: (value: {
    text: string
    imageSrc?: string
    partnershipLink?: string
  }) => void
}

const COPY = {
  post: {
    title: 'Créer une publication',
    label: 'Texte de la publication',
    placeholder: 'Quoi de neuf ?',
    submit: 'Publier',
    note: 'Votre publication est enregistrée sur cet appareil : elle sera diffusée aux autres utilisateurs quand le serveur sera connecté.',
  },
  story: {
    title: 'Ajouter à ma story',
    label: 'Texte de la story',
    placeholder: 'Partagez un instant…',
    submit: 'Ajouter la story',
    note: 'Votre story est enregistrée sur cet appareil : elle sera diffusée quand le serveur sera connecté.',
  },
} as const

const MAX = 500

function ComposeForm({ mode, onSubmit }: Pick<ComposeSheetProps, 'mode' | 'onSubmit'>) {
  const copy = COPY[mode]
  const [text, setText] = useState('')
  const [image, setImage] = useState('')
  const [partnershipLink, setPartnershipLink] = useState('')
  const [error, setError] = useState<string>()
  const [linkError, setLinkError] = useState<string>()

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed && !image) {
      setError('Ajoutez un texte ou une photo.')
      return
    }
    const link = partnershipLink.trim()
      ? normalizePartnershipLink(partnershipLink)
      : undefined
    if (partnershipLink.trim() && !link) {
      setLinkError('Lien invalide. Collez une URL ou un chemin AfriConnect.')
      return
    }
    onSubmit({
      text: trimmed,
      ...(image ? { imageSrc: image } : {}),
      ...(link ? { partnershipLink: link } : {}),
    })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id={`compose-${mode}`} label={copy.label} optional error={error}>
        {(a11y) => (
          <Textarea
            {...a11y}
            rows={4}
            maxLength={MAX}
            value={text}
            placeholder={copy.placeholder}
            onChange={(e) => {
              setText(e.target.value)
              setError(undefined)
            }}
          />
        )}
      </Field>
      <ImageField
        label="Photo"
        value={image}
        onChange={(value) => {
          setImage(value)
          setError(undefined)
        }}
        icon={ImageIcon}
        tone="brand"
        shape="wide"
        maxSize={1024}
      />
      {mode === 'post' ? (
        <PartnershipLinkField
          value={partnershipLink}
          error={linkError}
          onChange={(value) => {
            setPartnershipLink(value)
            setLinkError(undefined)
          }}
        />
      ) : null}
      <p className="text-caption text-muted-foreground">{copy.note}</p>
      <Button type="submit" size="lg" className="w-full">
        {copy.submit}
      </Button>
    </form>
  )
}

/** Feuille de création d'une publication ou d'une story (texte et photo facultative). */
export function ComposeSheet({ open, onClose, mode, onSubmit }: ComposeSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={COPY[mode].title}>
      <ComposeForm mode={mode} onSubmit={onSubmit} />
    </BottomSheet>
  )
}
