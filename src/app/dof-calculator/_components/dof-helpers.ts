export function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

export function sliderToDistance(val: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return Math.exp(minLog + val * (maxLog - minLog))
}

export function distanceToSlider(dist: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return (Math.log(dist) - minLog) / (maxLog - minLog)
}
