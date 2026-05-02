export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function getDirectionsUrl(lat: number, lng: number, _nombre?: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

const DAYS_ES: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3,
  jueves: 4, viernes: 5, sábado: 6,
}

export function isAbierto(
  apertura?: string | null,
  cierre?: string | null,
  dias?: string[] | string | null
): boolean {
  if (!apertura || !cierre) return true // sin datos = asumimos abierto

  const now = new Date()
  const hhmm = (s: string) => {
    const [h, m] = s.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  const currentMin = now.getHours() * 60 + now.getMinutes()
  const openMin = hhmm(apertura)
  let closeMin = hhmm(cierre)

  // Horario nocturno (ej 22:00 - 02:00)
  const isOvernight = closeMin <= openMin

  let timeOk: boolean
  if (isOvernight) {
    timeOk = currentMin >= openMin || currentMin < closeMin
  } else {
    timeOk = currentMin >= openMin && currentMin < closeMin
  }

  if (!dias) return timeOk

  const diasArr = Array.isArray(dias) ? dias : [dias]
  if (diasArr.length === 0) return timeOk

  const todayNum = now.getDay()
  const dayOk = diasArr.some(d => DAYS_ES[d.toLowerCase()] === todayNum)
  return dayOk && timeOk
}

export function formatHorario(apertura?: string | null, cierre?: string | null): string {
  if (!apertura || !cierre) return 'Horario no disponible'
  const fmt = (s: string) => s.substring(0, 5)
  return `${fmt(apertura)} – ${fmt(cierre)}`
}

export function formatDias(dias?: string[] | string | null): string {
  if (!dias) return ''
  const arr = Array.isArray(dias) ? dias : [dias]
  if (arr.length === 7) return 'Todos los días'
  if (arr.length === 0) return ''
  const caps = arr.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3))
  return caps.join(' · ')
}
