// milapp/src/lib/utils.ts

// Función para calcular la distancia en kilómetros entre dos puntos
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Función para formatear la distancia de manera legible
export function formatDistance(km: number): string {
  if (km < 1) {
    const metros = Math.round(km * 1000);
    return `${metros} metros`;
  } else {
    return `${km.toFixed(1)} km`;
  }
}

// Función para obtener la URL de direcciones de Google Maps
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Función para verificar si un local está abierto en un momento dado (simplificada)
export function isAbierto(apertura?: string, cierre?: string): boolean {
  if (!apertura || !cierre) return true;
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const minutosActuales = ahora.getMinutes();
  const aperturaSplit = apertura.split(':');
  const cierreSplit = cierre.split(':');
  const horaApertura = parseInt(aperturaSplit[0]);
  const minutosApertura = parseInt(aperturaSplit[1]);
  const horaCierre = parseInt(cierreSplit[0]);
  const minutosCierre = parseInt(cierreSplit[1]);

  if (horaActual > horaApertura && horaActual < horaCierre) return true;
  if (horaActual === horaApertura && minutosActuales >= minutosApertura) return true;
  if (horaActual === horaCierre && minutosActuales < minutosCierre) return true;
  return false;
}