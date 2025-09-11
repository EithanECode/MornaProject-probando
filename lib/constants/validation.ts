// Centralized validation constants & helpers
// Reuse across forms to keep limits consistent

export const MAX_NAME = 50;
export const MAX_EMAIL = 50;
export const MAX_PASSWORD = 50;
export const MAX_DESCRIPTION = 200;
// Integer digits (before decimal point) max for money-like fields
export const MAX_MONEY_INT_DIGITS = 7; // <= 9,999,999

// Regex: up to 7 integer digits, optional . and up to 2 decimals
const MONEY_REGEX = new RegExp(`^\\d{1,${MAX_MONEY_INT_DIGITS}}(\\.\\d{1,2})?$`);

export function isValidMoney(value: string | number): boolean {
  const str = String(value).trim();
  if (!str) return false;
  if (!MONEY_REGEX.test(str)) return false;
  const num = Number(str);
  if (isNaN(num)) return false;
  return num >= 0; // allow 0 for some contexts; caller can enforce >0
}

export function moneyIntDigits(value: string | number): number {
  const intPart = String(value).split('.')[0];
  return intPart.replace(/[^0-9]/g, '').length;
}

export function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

export function enforceLength(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, max: number, setter: (v: string) => void) {
  const val = e.target.value;
  setter(val.length > max ? val.slice(0, max) : val);
}
