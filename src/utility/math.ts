/**
 * Find the greatest common denominator between two numbers.
 * @param numerator Fraction numerator.
 * @param denominator Fraction denominator.
 */
export function greatestCommonDenominator(
  numerator: number,
  denominator: number
): number {
  return denominator
    ? greatestCommonDenominator(denominator, numerator % denominator)
    : numerator;
}

/**
 * Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
 * @param numerator Fraction numerator.
 * @param denominator Fraction denominator.
 */
export function reduceFraction(
  numerator: number,
  denominator: number
): Array<number> {
  const fracGcd = greatestCommonDenominator(numerator, denominator);
  return [numerator / fracGcd, denominator / fracGcd];
}
