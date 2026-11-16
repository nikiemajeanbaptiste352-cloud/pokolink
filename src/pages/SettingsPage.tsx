import {
  ChevronRight,
  Gift,
  Globe,
  History,
  LifeBuoy,
  Pencil,
  QrCode,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Switch } from '@/components/ui/switch'
import { useLocalStore } from '@/hooks/use-local-store'
import { useProfile } from '@/hooks/use-profile'
import { settingsStore, updateSetting, type AppSettings } from '@/lib/settings-store'
import { paths } from '@/routes/paths'

interface LinkRow {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

const TOGGLES: readonly { key: keyof AppSettings; label: string; description: string }[] =
  [
    {
      key: 'paymentAlerts',
      label: 'Paiements et Wallet',
      description: 'Confirmations, refus et demandes en attente.',
    },
    {
      key: 'messageAlerts',
      label: 'Messages',
      description: 'Nouveaux messages et réponses des professionnels.',
    },
    {
      key: 'eventAlerts',
      label: 'Événements',
      description: 'Creator Market, Market Event et AfriLearn.',
    },
    {
      key: 'offers',
      label: 'Offres et nouveautés',
      description: 'Promotions et nouvelles fonctions.',
    },
  ]

function Row({ to, label, description, icon: Icon }: LinkRow) {
  return (
    <Link to={to} className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-muted">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-brand">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-bold">{label}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}

/** Paramètres : accès au compte, préférences de notification, raccourcis et aide. */
export function SettingsPage() {
  const settings = useLocalStore(settingsStore)
  const profile = useProfile()

  const account: LinkRow[] = [
    {
      to: paths.profileEdit,
      label: 'Modifier le profil',
      description: 'Nom, photo, bio et ville',
      icon: Pencil,
    },
    {
      to: paths.creator(profile.handle),
      label: 'Ma page publique',
      description: 'Ce que voient les autres utilisateurs',
      icon: Globe,
    },
    {
      to: paths.profileQr,
      label: 'Mon QR code',
      description: 'Partager mon profil',
      icon: QrCode,
    },
  ]
  const shortcuts: LinkRow[] = [
    {
      to: paths.wallet,
      label: 'Wallet',
      description: 'Solde, dépôts et retraits',
      icon: Wallet,
    },
    {
      to: paths.rewards,
      label: 'Rewards',
      description: 'Points de fidélité',
      icon: Gift,
    },
    {
      to: paths.history,
      label: 'Historique',
      description: 'Paiements, achats et points',
      icon: History,
    },
  ]

  return (
    <>
      <PageHeader
        title="Paramètres"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />

      <section aria-labelledby="account-title" className="space-y-1 py-4">
        <SectionHeader
          title={<span id="account-title">Compte</span>}
          description={`@${profile.handle}`}
        />
        <ul className="divide-y">
          {account.map((row) => (
            <li key={row.to}>
              <Row {...row} />
            </li>
          ))}
        </ul>
      </section>
      <SectionDivider />

      <section aria-labelledby="notif-title" className="space-y-1 py-4">
        <SectionHeader
          title={<span id="notif-title">Notifications</span>}
          description="Choisissez ce que vous souhaitez recevoir"
        />
        <ul className="divide-y">
          {TOGGLES.map(({ key, label, description }) => (
            <li key={key} className="flex items-center gap-3 px-4 py-2">
              <span className="min-w-0 flex-1">
                <span className="block text-body font-bold">{label}</span>
                <span className="block text-caption text-muted-foreground">
                  {description}
                </span>
              </span>
              <Switch
                label={label}
                checked={settings[key]}
                onCheckedChange={(checked) => updateSetting(key, checked)}
              />
            </li>
          ))}
        </ul>
        <p className="px-4 pt-2 text-caption text-muted-foreground">
          Ces préférences sont enregistrées sur cet appareil.
        </p>
      </section>
      <SectionDivider />

      <section aria-labelledby="shortcuts-title" className="space-y-1 py-4">
        <SectionHeader
          title={<span id="shortcuts-title">Raccourcis</span>}
          description="Vos espaces personnels"
        />
        <ul className="divide-y">
          {shortcuts.map((row) => (
            <li key={row.to}>
              <Row {...row} />
            </li>
          ))}
        </ul>
      </section>
      <SectionDivider />

      <section aria-labelledby="help-title" className="space-y-1 py-4 pb-8">
        <SectionHeader
          title={<span id="help-title">Sécurité et aide</span>}
          description="Gérées par AfriConnect"
        />
        <p className="flex items-start gap-3 px-4 py-2 text-caption text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          Le mot de passe, le code PIN et la vérification d’identité sont gérés par le
          serveur AfriConnect : ils ne se modifient pas depuis cet écran.
        </p>
        <Row
          to={paths.conversation('c3')}
          label="Contacter le support"
          description="Écrire à AfriConnect Business"
          icon={LifeBuoy}
        />
      </section>
    </>
  )
}
