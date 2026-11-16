/**
 * Export d'une carte d'abonnement en image PNG (téléchargement). L'image est dessinée sur un
 * canvas à partir des mêmes informations que la carte affichée : même statut, même QR code.
 * Une carte « en attente de paiement » est exportée avec cette mention : l'image ne rend
 * jamais valable une carte que le serveur n'a pas activée.
 */
import { formatPrice } from '@/lib/format'
import { PLAN_DURATION_LABEL } from '@/lib/pro-labels'
import {
  formatCardNumber,
  formatValidity,
  getCardStatus,
  SUBSCRIPTION_STATUS,
} from '@/lib/subscription-labels'
import type { SubscriptionCard } from '@/types/subscription'

const WIDTH = 720
const PADDING = 48
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif'

const GREEN = '#0b6b3a'
const INK = '#111814'
const MUTED = '#4b5b52'

interface Banner {
  background: string
  color: string
}

function bannerFor(status: ReturnType<typeof getCardStatus>): Banner {
  if (status === 'active') return { background: '#e8f5ec', color: GREEN }
  if (status === 'pending_payment') return { background: '#fff4d6', color: '#7a5200' }
  return { background: '#fdecec', color: '#9b1c1c' }
}

/** Découpe un texte en lignes qui tiennent dans `maxWidth` (retour à la ligne par mots). */
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

export interface CardImageInput {
  card: SubscriptionCard
  proName: string
  proDomain: string
  /** Canvas du QR code affiché (absent si la carte n'a plus de QR code valable). */
  qr: HTMLCanvasElement | null
  now: number
}

/** Dessine la carte et renvoie le PNG. */
export async function renderCardPng({
  card,
  proName,
  proDomain,
  qr,
  now,
}: CardImageInput): Promise<Blob> {
  await document.fonts.ready
  const status = getCardStatus(card, now)
  const meta = SUBSCRIPTION_STATUS[status]
  const banner = bannerFor(status)
  const showQr = qr !== null && (status === 'active' || status === 'pending_payment')

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponible')

  const rows: [string, string][] = [
    ['Titulaire', card.holderName],
    ['Validité', formatValidity(card)],
    ['Numéro', formatCardNumber(card.number)],
    ['Statut', meta.label.toUpperCase()],
  ]

  // Mesure du texte pour fixer la hauteur de l'image.
  context.font = `800 40px ${FONT}`
  const planLines = wrap(context, card.planName, WIDTH - 2 * PADDING - 64)
  context.font = `600 26px ${FONT}`
  const headline = wrap(context, meta.headline, WIDTH - 2 * PADDING - 40)
  const note = showQr
    ? status === 'pending_payment'
      ? 'Ce QR code ne sera valable qu’après la confirmation du paiement par le serveur.'
      : 'Le prestataire scanne ce QR code pour vérifier votre abonnement.'
    : status === 'expired'
      ? 'Abonnement expiré : ce QR code n’est plus valable.'
      : status === 'cancelled'
        ? 'Carte annulée : ce QR code n’est plus valable.'
        : ''
  context.font = `500 22px ${FONT}`
  const noteLines = note ? wrap(context, note, WIDTH - 2 * PADDING) : []

  const height =
    120 + // en-tête
    (headline.length * 36 + 44) + // bandeau de statut
    130 + // identité
    (planLines.length * 48 + 116) + // forfait
    rows.length * 54 +
    32 +
    (showQr ? 330 : 0) +
    noteLines.length * 32 +
    80

  canvas.width = WIDTH
  canvas.height = height
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, WIDTH, height)

  // En-tête
  context.fillStyle = GREEN
  context.fillRect(0, 0, WIDTH, 120)
  context.fillStyle = '#ffffff'
  context.textBaseline = 'middle'
  context.font = `800 44px ${FONT}`
  context.textAlign = 'left'
  context.fillText('AfriConnect', PADDING, 60)
  context.font = `700 26px ${FONT}`
  context.textAlign = 'right'
  context.fillText('Carte d’abonnement', WIDTH - PADDING, 60)
  context.textAlign = 'left'

  // Bandeau de statut
  let y = 120
  const bannerHeight = headline.length * 36 + 44
  context.fillStyle = banner.background
  context.fillRect(0, y, WIDTH, bannerHeight)
  context.fillStyle = banner.color
  context.font = `800 26px ${FONT}`
  headline.forEach((line, index) => {
    context.fillText(line, PADDING, y + 22 + 18 + index * 36)
  })
  y += bannerHeight

  // Identité du Service Pro
  y += 30
  context.fillStyle = INK
  context.font = `800 32px ${FONT}`
  context.fillText(proName, PADDING, y + 22)
  if (proDomain) {
    context.fillStyle = MUTED
    context.font = `500 24px ${FONT}`
    context.fillText(proDomain, PADDING, y + 62)
  }
  y += 100

  // Forfait
  const planHeight = planLines.length * 48 + 92
  context.fillStyle = '#f1f5f2'
  context.beginPath()
  context.roundRect(PADDING, y, WIDTH - 2 * PADDING, planHeight, 24)
  context.fill()
  context.fillStyle = MUTED
  context.font = `700 20px ${FONT}`
  context.fillText('FORFAIT', PADDING + 32, y + 30)
  context.fillStyle = INK
  context.font = `800 40px ${FONT}`
  planLines.forEach((line, index) => {
    context.fillText(line, PADDING + 32, y + 72 + index * 48)
  })
  context.fillStyle = MUTED
  context.font = `500 24px ${FONT}`
  context.fillText(
    `${PLAN_DURATION_LABEL[card.planDuration]} · ${formatPrice(card.price)}`,
    PADDING + 32,
    y + 72 + planLines.length * 48 - 4 + 6,
  )
  y += planHeight + 24

  // Informations
  context.setLineDash([8, 6])
  context.strokeStyle = '#c3cec7'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(PADDING, y)
  context.lineTo(WIDTH - PADDING, y)
  context.stroke()
  rows.forEach(([label, value], index) => {
    const rowY = y + 27 + index * 54
    context.textAlign = 'left'
    context.fillStyle = MUTED
    context.font = `500 24px ${FONT}`
    context.fillText(label, PADDING, rowY)
    context.textAlign = 'right'
    context.fillStyle = INK
    context.font = `${index === 1 ? 500 : 800} 24px ${FONT}`
    context.fillText(value, WIDTH - PADDING, rowY, WIDTH - 2 * PADDING - 170)
    context.beginPath()
    context.moveTo(PADDING, rowY + 27)
    context.lineTo(WIDTH - PADDING, rowY + 27)
    context.stroke()
  })
  context.setLineDash([])
  context.textAlign = 'left'
  y += rows.length * 54 + 32

  // QR code
  if (showQr && qr) {
    const size = 300
    context.globalAlpha = status === 'pending_payment' ? 0.4 : 1
    context.imageSmoothingEnabled = false
    context.drawImage(qr, (WIDTH - size) / 2, y, size, size)
    context.imageSmoothingEnabled = true
    context.globalAlpha = 1
    y += size + 30
  }

  // Remarque et code
  context.textAlign = 'center'
  context.fillStyle = MUTED
  context.font = `500 22px ${FONT}`
  noteLines.forEach((line, index) => {
    context.fillText(line, WIDTH / 2, y + 16 + index * 32)
  })
  if (showQr) {
    context.fillStyle = INK
    context.font = `800 26px ui-monospace, "Cascadia Mono", Consolas, monospace`
    context.fillText(
      card.verificationCode,
      WIDTH / 2,
      y + 16 + noteLines.length * 32 + 20,
    )
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export impossible'))),
      'image/png',
    )
  })
}

/** Télécharge un fichier dans le navigateur. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
