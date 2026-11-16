const MAX_FILE_BYTES = 10 * 1024 * 1024

/**
 * Lit une image choisie par l'utilisateur et la réduit (côté le plus long = `maxSize`)
 * pour rester léger dans le stockage local. Renvoie une data URL.
 */
export async function readImageAsDataUrl(file: File, maxSize: number): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Ce fichier n’est pas une image.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Image trop lourde (10 Mo maximum).')
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('Impossible de lire cette image.')
  })
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossible de traiter cette image.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // WebP garde la transparence des logos ; les navigateurs sans WebP retombent sur PNG.
  return canvas.toDataURL('image/webp', 0.85)
}
