import { QRCodeSVG } from 'qrcode.react'

import { cn } from '@/lib/utils'
import type { TicketPaper } from '@/types/service'

interface TicketPreviewProps {
  name: string
  logo: string
  header: string
  footer: string
  showLogo: boolean
  showQr: boolean
  paper: TicketPaper
  /** Adresse encodée dans le QR code du ticket. */
  qrValue: string
}

/** Aperçu d'un ticket avec des lignes d'exemple (aucune donnée réelle). */
export function TicketPreview({
  name,
  logo,
  header,
  footer,
  showLogo,
  showQr,
  paper,
  qrValue,
}: TicketPreviewProps) {
  return (
    <figure
      className={cn(
        'mx-auto space-y-2 rounded-md border border-dashed bg-white p-4 font-mono text-xs text-[#111814]',
        paper === '58mm' ? 'w-48' : 'w-64',
      )}
    >
      <div className="space-y-1 text-center">
        {showLogo && logo ? (
          <img src={logo} alt="" className="mx-auto size-10 rounded-full object-cover" />
        ) : null}
        <p className="text-sm font-bold break-words">
          {name || 'Nom de l’établissement'}
        </p>
        {header ? <p className="break-words">{header}</p> : null}
      </div>
      <hr className="border-dashed border-[#9aa8a0]" />
      <p className="flex justify-between gap-2">
        <span>Article exemple x2</span>
        <span>2 000</span>
      </p>
      <p className="flex justify-between gap-2">
        <span>Autre article</span>
        <span>500</span>
      </p>
      <hr className="border-dashed border-[#9aa8a0]" />
      <p className="flex justify-between gap-2 font-bold">
        <span>TOTAL</span>
        <span>2 500 FCFA</span>
      </p>
      {footer ? <p className="text-center break-words">{footer}</p> : null}
      {showQr ? (
        <div className="flex justify-center pt-1">
          <QRCodeSVG value={qrValue} size={64} marginSize={0} />
        </div>
      ) : null}
      <figcaption className="sr-only">
        Aperçu du ticket avec des lignes d’exemple
      </figcaption>
    </figure>
  )
}
