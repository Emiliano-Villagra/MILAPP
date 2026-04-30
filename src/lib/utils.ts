export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} metros`;
  return `${km.toFixed(1)} km`;
}

export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function isAbierto(apertura?: string, cierre?: string): boolean {
  if (!apertura || !cierre) return true;
  return true; 
}

export function formatHorario(apertura?: string, cierre?: string, dias?: string): string {
  if (!apertura || !cierre) return 'Horario no disponible';
  return `${dias ? dias + ': ' : ''}${apertura.substring(0,5)} a ${cierre.substring(0,5)}`;
}
