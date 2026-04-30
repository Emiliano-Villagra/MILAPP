export function haversineKm(lat1: any, lon1: any, lat2: any, lon2: any, ...args: any[]): number {
  const R = 6371; 
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180)) * Math.cos(Number(lat2) * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: any, ...args: any[]): string {
  const n = Number(km);
  if (n < 1) return `${Math.round(n * 1000)} metros`;
  return `${n.toFixed(1)} km`;
}

export function getDirectionsUrl(lat: any, lng: any, ...args: any[]): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function isAbierto(apertura?: any, cierre?: any, dias?: any, ...args: any[]): boolean {
  if (!apertura || !cierre) return true;
  return true; 
}

export function formatHorario(apertura?: any, cierre?: any, dias?: any, ...args: any[]): string {
  if (!apertura || !cierre) return 'Horario no disponible';
  return `${dias ? dias + ': ' : ''}${String(apertura).substring(0,5)} a ${String(cierre).substring(0,5)}`;
}
