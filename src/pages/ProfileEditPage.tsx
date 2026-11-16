import { User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { Field } from '@/components/form/Field'
import { ImageField } from '@/components/form/ImageField'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useProfile } from '@/hooks/use-profile'
import { saveProfile } from '@/lib/profile-store'
import { paths } from '@/routes/paths'

const BIO_MAX = 160

/**
 * Modifier le profil : nom, photo, bio, ville et pays. L'identifiant (@handle), la vérification
 * et les statistiques viennent du serveur. Les modifications restent sur cet appareil.
 */
export function ProfileEditPage() {
  const profile = useProfile()
  const navigate = useNavigate()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [city, setCity] = useState(profile.city)
  const [country, setCountry] = useState(profile.country)
  const [avatar, setAvatar] = useState(profile.avatarSrc ?? '')
  const [error, setError] = useState<string>()

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) {
      setError('Saisissez votre nom (2 caractères minimum).')
      return
    }
    saveProfile({
      name: name.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      ...(avatar ? { avatarSrc: avatar } : {}),
    })
    void navigate(paths.profile)
  }

  return (
    <>
      <PageHeader
        title="Modifier le profil"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />

      <form onSubmit={submit} noValidate className="space-y-4 px-4 py-4">
        <ImageField
          label="Photo de profil"
          value={avatar}
          onChange={setAvatar}
          icon={User}
          tone="brand"
          shape="round"
          maxSize={400}
        />
        <Field id="pf-name" label="Nom" error={error}>
          {(a11y) => (
            <Input
              {...a11y}
              value={name}
              maxLength={60}
              onChange={(e) => {
                setName(e.target.value)
                setError(undefined)
              }}
            />
          )}
        </Field>
        <Field
          id="pf-handle"
          label="Identifiant"
          hint="Rattaché à votre compte : il ne se modifie pas ici."
        >
          {(a11y) => <Input {...a11y} value={`@${profile.handle}`} readOnly />}
        </Field>
        <Field
          id="pf-bio"
          label="Bio"
          optional
          hint={`${bio.length}/${BIO_MAX} caractères`}
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              rows={3}
              value={bio}
              maxLength={BIO_MAX}
              onChange={(e) => setBio(e.target.value)}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="pf-city" label="Ville">
            {(a11y) => (
              <Input {...a11y} value={city} onChange={(e) => setCity(e.target.value)} />
            )}
          </Field>
          <Field id="pf-country" label="Pays">
            {(a11y) => (
              <Input
                {...a11y}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            )}
          </Field>
        </div>
        <p className="text-caption text-muted-foreground">
          Les modifications sont enregistrées sur cet appareil. Le serveur les validera
          quand il sera connecté.
        </p>
        <div className="flex gap-2">
          <Link
            to={paths.profile}
            className={buttonVariants({
              variant: 'outline',
              size: 'lg',
              className: 'flex-1',
            })}
          >
            Annuler
          </Link>
          <Button type="submit" size="lg" className="flex-1">
            Enregistrer
          </Button>
        </div>
      </form>
    </>
  )
}
