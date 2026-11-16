import { Copy, Globe, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { FlashMessage } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { useFlash } from '@/hooks/use-flash'
import { useProfile } from '@/hooks/use-profile'
import { useShare } from '@/hooks/use-share'
import { paths } from '@/routes/paths'

/** Mon QR code : le lien de ma page publique, à faire scanner, copier ou partager. */
export function ProfileQrPage() {
  const profile = useProfile()
  const { message: shareMessage, share } = useShare()
  const { message: copyMessage, flash } = useFlash()
  const path = paths.creator(profile.handle)
  const url = `${window.location.origin}${path}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      flash('Lien copié dans le presse-papiers.')
    } catch {
      flash('Impossible de copier le lien sur cet appareil.')
    }
  }

  return (
    <>
      <PageHeader
        title="Mon QR code"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />
      <FlashMessage message={shareMessage || copyMessage} />

      <section
        aria-label="QR code de mon profil"
        className="mx-auto flex max-w-80 flex-col items-center gap-3 px-4 py-6 text-center"
      >
        <div className="rounded-2xl border bg-white p-4">
          <QRCodeSVG
            value={url}
            size={208}
            marginSize={0}
            role="img"
            title={`QR code vers la page de ${profile.name}`}
          />
        </div>
        <Avatar name={profile.name} src={profile.avatarSrc} size="lg" />
        <div>
          <p className="text-title font-extrabold">{profile.name}</p>
          <p className="text-body text-muted-foreground">@{profile.handle}</p>
        </div>
        <p className="text-caption text-muted-foreground">
          Scannez ce code pour ouvrir ma page publique AfriConnect.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 px-4 pb-8">
        <Button className="flex-1" onClick={() => void share(path, profile.name)}>
          <Share2 aria-hidden="true" />
          Partager
        </Button>
        <Button variant="outline" onClick={() => void copy()}>
          <Copy aria-hidden="true" />
          Copier le lien
        </Button>
        <Link to={path} className={buttonVariants({ variant: 'outline' })}>
          <Globe aria-hidden="true" />
          Voir ma page
        </Link>
      </div>
    </>
  )
}
