export function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}
