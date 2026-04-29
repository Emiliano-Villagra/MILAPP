// milapp/src/pages/MapaPage.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapaPage.module.css';

// Fix para íconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Marcadores personalizados según el prompt
const markerIconOrange = new L.DivIcon({
  className: styles.markerContainer,
  html: '<div class="marker marker-orange">🥪</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const markerIconBlue = new L.DivIcon({
  className: styles.markerContainer,
  html: '<div class="marker marker-blue">🥪</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const center = [-26.83, -65.2]; // San Miguel de Tucumán

const MapaPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <MapContainer center={center} zoom={13} className={styles.mapContainer} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {/* Marcadores de ejemplo */}
        <Marker position={[-26.82, -65.19]} icon={markerIconOrange}>
          <Popup className={styles.mapPopup}>
            <div className={styles.popupContent}>
              <h4>Sanguchería La Mila</h4>
              <p>Av. Mate de Luna 1234</p>
              <div className="badge-blue">5.0 ⭐ | 34 reseña(s)</div>
            </div>
          </Popup>
        </Marker>
        <Marker position={[-26.84, -65.21]} icon={markerIconBlue}>
          <Popup className={styles.mapPopup}>
            <div className={styles.popupContent}>
              <h4>Tucumán Delivery</h4>
              <p>Calle Falsa 123</p>
              <div className="badge-blue">4.8 ⭐ | 21 reseña(s)</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaPage;