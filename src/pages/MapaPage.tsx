import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CRITICO PARA QUE SE VEA BIEN

export default function MapaPage() {
  const position: [number, number] = [-26.8241, -65.2226]; // Tucumán

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>¡MILAPP Tucumán!</Popup>
      </Marker>
    </MapContainer>
  );
}
