export function toUrlSafeBase64(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-') // replace + with -
    .replace(/\//g, '_') // replace / with _
    .replace(/=+$/, ''); // remove trailing =
}