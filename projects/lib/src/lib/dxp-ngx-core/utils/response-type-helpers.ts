/**
 * Returns either the first non-empty string value of s if s is an array or s itself if s is a string.
 * Otherwise returns undefined.
 */
export function valueOf(s: undefined | string | string[]): string | undefined {
  if (!s) {
    return undefined;
  }
  return Array.isArray(s) ? s.find((s) => s && s != '') : s;
}

/**
 * Returns either the value of s or an empty string if s is undefined.
 * To be used for value assignments to non-optional fields.
 */
export function valueOrEmptyString(s: undefined | string): string {
  if (!s) {
    return '';
  }
  return s;
}
