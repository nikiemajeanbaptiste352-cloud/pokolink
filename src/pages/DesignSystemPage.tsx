import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { ComponentsShowcase } from './ComponentsShowcase'

const swatches = [
  { name: 'brand', className: 'bg-brand text-brand-foreground' },
  { name: 'gold', className: 'bg-gold text-gold-foreground' },
  { name: 'violet', className: 'bg-violet text-violet-foreground' },
  { name: 'muted', className: 'bg-muted text-foreground' },
  { name: 'accent', className: 'bg-accent text-accent-foreground' },
  { name: 'destructive', className: 'bg-destructive text-destructive-foreground' },
  { name: 'success', className: 'bg-success text-white' },
] as const

/** Aperçu de vérification des tokens visuels (page de développement). */
export function DesignSystemPage() {
  const [dark, setDark] = useState(false)

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <main className="mx-auto max-w-xl space-y-8 p-4 pb-12">
      <header className="flex items-center justify-between">
        <h1 className="text-headline font-extrabold text-brand">Design system</h1>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {dark ? 'Thème clair' : 'Thème sombre'}
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="text-title font-bold">Couleurs</h2>
        <div className="grid grid-cols-3 gap-2">
          {swatches.map((s) => (
            <div
              key={s.name}
              className={`${s.className} rounded-lg p-3 text-caption font-semibold`}
            >
              {s.name}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-title font-bold">Typographie</h2>
        <p className="text-headline font-extrabold">Titre d'écran 24</p>
        <p className="text-title font-bold">Titre de section 17</p>
        <p className="text-body">Texte courant 15 : « Quoi de neuf, Amadou ? »</p>
        <p className="text-caption text-muted-foreground">Métadonnée 12 · il y a 2h</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title font-bold">Boutons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="violet">Violet</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button size="icon" variant="secondary" aria-label="Rechercher">
            <Search />
          </Button>
          <Button size="icon" variant="secondary" aria-label="Notifications">
            <Bell />
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-title font-bold">Formes et ombres</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-4 text-sm shadow-card">
            Carte 12px
          </div>
          <div className="rounded-xl bg-card p-4 text-sm shadow-float">Bannière 16px</div>
        </div>
      </section>

      <ComponentsShowcase />
    </main>
  )
}
