import type { FieldPath } from 'react-hook-form'

import type { ServiceConfigValues } from '@/lib/service-schemas'

export interface WizardStep {
  /** Titre de l'écran (en-tête). */
  title: string
  /** Libellé court pour la navigation en mode modification. */
  shortLabel: string
  /** Phrase d'introduction sous l'en-tête. */
  intro: string
  /** Champs validés avant de quitter l'étape. */
  fields: FieldPath<ServiceConfigValues>[]
}

/** Les 8 étapes de création d'un service, dans l'ordre. */
export const WIZARD_STEPS: readonly WizardStep[] = [
  {
    title: 'Type d’activité',
    shortLabel: 'Activité',
    intro: 'Quel type d’établissement souhaitez-vous créer ?',
    fields: ['type', 'name'],
  },
  {
    title: 'Identité',
    shortLabel: 'Identité',
    intro: 'Présentez votre établissement à vos clients.',
    fields: ['logo', 'cover', 'description'],
  },
  {
    title: 'Localisation',
    shortLabel: 'Lieu',
    intro: 'Où se trouve votre établissement ?',
    fields: ['country', 'city', 'address'],
  },
  {
    title: 'Contacts',
    shortLabel: 'Contacts',
    intro: 'Comment vous joindre ?',
    fields: ['contacts'],
  },
  {
    title: 'Configuration métier',
    shortLabel: 'Métier',
    intro: 'Paramètres spécifiques à votre activité',
    fields: ['businessDetails', 'hours'],
  },
  {
    title: 'Paiements',
    shortLabel: 'Paiements',
    intro: 'Quels moyens de paiement acceptez-vous ?',
    fields: ['paymentMethods', 'allowMerchantCredit', 'ticket'],
  },
  {
    title: 'Personnalisation',
    shortLabel: 'Style',
    intro: 'Donnez une identité unique à votre espace',
    fields: ['accent', 'username', 'welcomeMessage'],
  },
  {
    title: 'Vérification',
    shortLabel: 'Vérification',
    intro: 'Vérifiez vos informations avant de créer',
    fields: [],
  },
]

export const LAST_STEP = WIZARD_STEPS.length - 1
