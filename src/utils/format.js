/** Display helpers for money and percentages. */

/** Formats a number as South African rand, e.g. 1560.5 -> 'R1 560.50'. */
export function formatRand(amount) {
  const value = Number(amount) || 0;
  const [whole, cents] = Math.abs(value).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${value < 0 ? '-' : ''}R${grouped}.${cents}`;
}

/** Formats a percentage without trailing zeros, e.g. 12.5 -> '12.5%', 10 -> '10%'. */
export function formatPercent(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return `${rounded}%`;
}
