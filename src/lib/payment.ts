const PHONE_DIGITS_MIN = 8

/** Message d'erreur du numéro Mobile Money, ou chaîne vide s'il est valide. */
export function getPhoneError(phone: string): string {
  return phone.replace(/\D/g, '').length < PHONE_DIGITS_MIN
    ? `Saisissez un numéro d’au moins ${PHONE_DIGITS_MIN} chiffres.`
    : ''
}
