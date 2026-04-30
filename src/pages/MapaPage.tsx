import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente para centrar el mapa
function RecenterButton({ coords }: { coords: [number, number] }) {
  const map = useMap();
  const handleLocation = () => {
    map.flyTo(coords, 15);
  };

  return (
    <button 
      onClick={handleLocation}
      style={{
        position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000,
        backgroundColor: 'var(--blue)', color: 'white', border: 'none',
        borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)', cursor: 'pointer'
      }}
    >
      📍
    </button>
  );
}

export default function MapaPage() {
  const [userPos, setUserPos] = useState<[number, number]>([-26.8241, -65.2226]); // Tucumán por defecto

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error de GPS:", err)
    );
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapContainer center={userPos} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={userPos} />
        <RecenterButton coords={userPos} />
      </MapContainer>
    </div>
  );
}
