/** Teinte (0-360) stable d'après un texte : deux établissements gardent chacun la leur. */
export function hueOf(text: string): number {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
}
