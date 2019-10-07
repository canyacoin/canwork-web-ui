export function getUsdToCan(canToUsd: number, usd: number): string {
  if (canToUsd) {
    return (usd / canToUsd).toFixed(2)
  }
  return '-'
}
