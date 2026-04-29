import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapaPage.css';

// Arreglo temporal de íconos para Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapaPage() {
  return (
    <div className="map-container">
      <MapContainer center={[-26.83, -65.2]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png" />
        <Marker position={[-26.82, -65.19]}>
          <Popup><b>El Gringo Sanguchería</b><br/>Av. Mate de Luna 123</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
