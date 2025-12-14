export function hasBit(value: number, bit: number): boolean {
  return (value & bit) !== 0;
}
