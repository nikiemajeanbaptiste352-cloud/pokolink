import { Camera, CameraOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

/** Le détecteur de QR codes du navigateur (Chrome, Edge, Android) : absent des définitions TS. */
interface QrDetector {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>
}
type QrDetectorConstructor = new (options?: { formats?: string[] }) => QrDetector

function getDetector(): QrDetectorConstructor | undefined {
  return (window as unknown as { BarcodeDetector?: QrDetectorConstructor })
    .BarcodeDetector
}

function cameraSupported(): boolean {
  return Boolean(getDetector()) && Boolean(navigator.mediaDevices?.getUserMedia)
}

interface QrScannerProps {
  /** Texte lu dans le QR code (une fois, puis la caméra s'arrête). */
  onScan: (value: string) => void
}

/**
 * Scanner à la caméra. La caméra ne démarre que sur un geste du prestataire (bouton) et
 * s'arrête dès qu'un QR code est lu, ou quand l'écran est quitté. Sur un appareil sans
 * détecteur de QR code, le composant l'explique : le prestataire peut alors saisir le code
 * ou scanner avec l'appareil photo du téléphone (le QR code ouvre cette page).
 */
export function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const mountedRef = useRef(false)
  const [state, setState] = useState<'idle' | 'starting' | 'scanning'>('idle')
  const [error, setError] = useState('')
  const supported = cameraSupported()

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stop()
    }
  }, [stop])

  async function start() {
    const Detector = getDetector()
    if (!Detector || !navigator.mediaDevices?.getUserMedia) return
    setError('')
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      const video = videoRef.current
      if (!mountedRef.current || !video) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      video.srcObject = stream
      await video.play()
      const detector = new Detector({ formats: ['qr_code'] })
      setState('scanning')

      let busy = false
      timerRef.current = window.setInterval(() => {
        if (busy || video.readyState < 2) return
        busy = true
        detector
          .detect(video)
          .then((codes) => {
            const value = codes[0]?.rawValue
            if (value && mountedRef.current) {
              stop()
              setState('idle')
              onScan(value)
            }
          })
          .catch(() => {
            // Image illisible : on réessaie au prochain passage.
          })
          .finally(() => {
            busy = false
          })
      }, 300)
    } catch (caught) {
      stop()
      if (!mountedRef.current) return
      setState('idle')
      setError(
        caught instanceof DOMException && caught.name === 'NotAllowedError'
          ? 'L’accès à la caméra est refusé. Autorisez-le dans les réglages du navigateur, ou saisissez le code.'
          : 'La caméra est indisponible. Saisissez le code, ou scannez avec l’appareil photo du téléphone.',
      )
    }
  }

  function cancel() {
    stop()
    setState('idle')
  }

  if (!supported) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-muted p-3.5 text-body">
        <CameraOff
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span>
          Le scan par la caméra n’est pas disponible sur ce navigateur. Saisissez le
          numéro ou le code ci-dessous, ou scannez le QR code avec l’appareil photo du
          téléphone : il ouvre cette page avec le code.
        </span>
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className={
          state === 'idle'
            ? 'hidden'
            : 'relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black'
        }
      >
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Aperçu de la caméra"
          className="size-full object-cover"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/90"
        />
      </div>
      {state === 'scanning' ? (
        <p role="status" className="text-center text-caption text-muted-foreground">
          Placez le QR code du client dans le cadre.
        </p>
      ) : null}
      {state === 'idle' ? (
        <Button type="button" size="lg" className="w-full" onClick={() => void start()}>
          <Camera aria-hidden="true" />
          Scanner avec la caméra
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          onClick={cancel}
        >
          Arrêter la caméra
        </Button>
      )}
      <p role="alert" className="text-body text-destructive empty:hidden">
        {error}
      </p>
    </div>
  )
}
