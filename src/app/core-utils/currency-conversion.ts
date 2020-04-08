export function getUsdToCan(usdToAtomicCan: number, usd: number): string {
  if (usdToAtomicCan) {
    const totalAtomicCan = usd * usdToAtomicCan
    return formatAtomicAsset(roundAtomicAssetTwoDecimals(totalAtomicCan))
  }
  return '-'
}

// Rounds given amount of atomic ASSET to closest amount of atomic CAN
// that can be presented with two or less decimals, for example
// 123456789 => 123000000 which is 1.23 CAN
export function roundAtomicAssetTwoDecimals(atomicAsset: number): number {
  return Math.round(atomicAsset / 1e6) * 1e6
}

// formats atomic ASSET, for example
// 1 => "0.00000001"
// 123000000 => "1.23"
export function formatAtomicAsset(atomicAsset: number): string {
  const intPart = Math.floor(atomicAsset / 1e8).toString()
  const decimalPart = (atomicAsset % 1e8)
    .toString()
    .padStart(8, '0')
    .replace(/0+$/g, '')
  let result = intPart
  if (decimalPart.length !== 0) {
    result = `${result}.${decimalPart}`
  }
  return result
}
