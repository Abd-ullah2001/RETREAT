/**
 * WhatsApp wa.me deep links — no API, pure string manipulation.
 */

/** Strip formatting; wa.me expects digits only with country code (no +) */
export function sanitizePhone(hostPhone: string): string {
  return hostPhone.replace(/[\s\-()+]/g, '').replace(/^\+/, '');
}

export function buildWaLink(hostPhone: string | null | undefined, messageText: string): string | null {
  if (!hostPhone || hostPhone.trim() === '') {
    return null;
  }
  const sanitized = sanitizePhone(hostPhone);
  if (!sanitized) {
    return null;
  }
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(messageText)}`;
}

export function buildWaCopyFallback(messageText: string): string {
  return messageText;
}
