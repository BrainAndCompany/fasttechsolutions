/** Normalize phone for storage and uniqueness checks. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").trim();
}

export function isValidPhone(normalized: string): boolean {
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
