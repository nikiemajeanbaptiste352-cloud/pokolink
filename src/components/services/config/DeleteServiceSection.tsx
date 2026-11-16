import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/use-services'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

/** Zone sensible : suppression définitive d'un service et de toutes ses données. */
export function DeleteServiceSection({ service }: { service: Service }) {
  const navigate = useNavigate()
  const { deleteService } = useServices()
  const [confirming, setConfirming] = useState(false)

  return (
    <section
      aria-labelledby="delete-service-title"
      className="mx-4 mb-6 space-y-3 rounded-xl border border-destructive/40 p-4"
    >
      <h2 id="delete-service-title" className="text-title font-bold text-danger">
        Supprimer ce service
      </h2>
      <p className="text-body text-muted-foreground">
        Le catalogue, les commandes et toutes les données de « {service.name} » seront
        supprimés définitivement. Vos autres services ne sont pas touchés.
      </p>
      {confirming ? (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="destructive"
            onClick={() => {
              deleteService(service.id)
              void navigate(paths.profile, { replace: true })
            }}
          >
            <Trash2 aria-hidden="true" />
            Oui, supprimer définitivement
          </Button>
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          <Trash2 aria-hidden="true" />
          Supprimer le service
        </Button>
      )}
    </section>
  )
}
