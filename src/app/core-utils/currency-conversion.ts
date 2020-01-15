export function getUsdToCan(usdToAtomicCan: number, usd: number): string {
  if (usdToAtomicCan) {
    const totalAtomicCan = usd * usdToAtomicCan
    return formatAtomicCan(roundAtomicCanTwoDecimals(totalAtomicCan))
  }
  return '-'
}

// Rounds given amount of atomic CAN to closest amount of atomic CAN
// that can be presented with two or less decimals, for example
// 123456789 => 123000000 which is 1.23 CAN
export function roundAtomicCanTwoDecimals(atomicCan: number): number {
  return Math.round(atomicCan / 1e6) * 1e6
}

// formats atomic CAN, for example
// 1 => "0.00000001"
// 123000000 => "1.23"
export function formatAtomicCan(atomicCan: number): string {
  const intPart = Math.floor(atomicCan / 1e8).toString()
  const decimalPart = (atomicCan % 1e8)
    .toString()
    .padStart(8, '0')
    .replace(/0+$/g, '')
  let result = intPart
  if (decimalPart.length !== 0) {
    result = `${result}.${decimalPart}`
  }
  return result
}
