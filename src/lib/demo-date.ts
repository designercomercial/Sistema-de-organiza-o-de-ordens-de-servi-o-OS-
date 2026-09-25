/** Relógio da demonstração: 9 de setembro de 2026, 09:15. */
export const DEMO_TODAY = "2026-09-09"
export const DEMO_NOW_MINUTES = 9 * 60 + 15

export function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

export function addHoursToTime(time: string, hours: number) {
  const total = parseTimeToMinutes(time) + Math.round(hours * 60)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
