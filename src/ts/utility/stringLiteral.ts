/**
 * Used with normal input strings to provide values to interpolate using a
 * set of params.
 *
 * ```js
 * const template = 'Example text: ${text}';
 * const result = interpolate({
 *   text: 'Foo bar'
 * }, template);
 * // Example text: Foo bar
 * ```
 *
 * @param params Params to be used in the interpolate.
 * @param value Normal string value to interpolate.
 * @returns String literal interpolated string.
 */
export function interpolate(params: Record<string, any>, value: string) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${value}\`;`)(...vals);
}
