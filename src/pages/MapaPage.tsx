import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase, type Local } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { haversineKm } from '@/lib/utils'
import MapFilters from '@/components/map/MapFilters'
import LocalCard from '@/components/map/LocalCard'
import LocalDrawer from '@/components/map/LocalDrawer'
import { Locate, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './MapaPage.module.css'

// ── Custom marker factory ─────────────────────────────────────
function createMarker(selected: boolean, verificado: boolean) {
  const cls = ['mila-marker', selected ? 'selected' : '', verificado ? 'verified' : ''].filter(Boolean).join(' ')
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"><span>🥩</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// ── Recenter helper ───────────────────────────────────────────
function RecenterOnLocation({ coords }: { coords: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.2 })
  }, [coords])
  return null
}

// ── Map click to deselect ─────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick })
  return null
}

export default function MapaPage() {
  const { userLocation, requestLocation, searchQuery, soloDelivery, soloVerificados, radioKm } = useAppStore()

  const [locales, setLocales] = useState<Local[]>([])
  const [selected, setSelected] = useState<Local | null>(null)
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('locales').select('*').eq('activo', true).then(({ data }) => {
      setLocales((data as Local[]) ?? [])
    })
    requestLocation()
  }, [])

  // ── Filter locales ────────────────────────────────────────
  const filtered = locales.filter(l => {
    if (soloDelivery && !l.tiene_delivery) return false
    if (soloVerificados && !l.verificado) return false
    if (userLocation) {
      const d = haversineKm(userLocation.lat, userLocation.lng, l.lat, l.lng)
      if (d > radioKm) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const hay = [l.nombre, l.barrio, l.direccion, ...(l.tags ?? [])].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }).map(l => ({
    ...l,
    distancia: userLocation ? haversineKm(userLocation.lat, userLocation.lng, l.lat, l.lng) : undefined,
  })).sort((a, b) => (a.distancia ?? 999) - (b.distancia ?? 999))

  const handleSelectLocal = useCallback((local: Local) => {
    setSelected(local)
    setFlyTo([local.lat, local.lng])
    setListOpen(false)
  }, [])

  const handleLocateMe = () => {
    requestLocation()
    if (userLocation) setFlyTo([userLocation.lat, userLocation.lng])
  }

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-26.8241, -65.2226]

  return (
    <div className={styles.page}>
      {/* Map */}
      <div className={styles.mapWrap}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
          />

          {filtered.map(local => (
            <Marker
              key={local.id}
              position={[local.lat, local.lng]}
              icon={createMarker(selected?.id === local.id, !!local.verificado)}
              eventHandlers={{ click: () => handleSelectLocal(local) }}
            />
          ))}

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: '',
                html: '<div style="width:14px;height:14px;background:#0A4DA6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(10,77,166,0.3)"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              })}
            />
          )}

          <RecenterOnLocation coords={flyTo} />
          <MapClickHandler onMapClick={() => setSelected(null)} />
        </MapContainer>

        {/* Filters floating */}
        <div className={styles.filtersFloat}>
          <MapFilters />
        </div>

        {/* Locate me button */}
        <button className={styles.locateBtn} onClick={handleLocateMe} title="Mi ubicación">
          <Locate size={20} />
        </button>

        {/* Results count pill */}
        <button className={styles.resultsPill} onClick={() => setListOpen(v => !v)}>
          <span className={styles.pillCount}>{filtered.length}</span>
          sangucherías
          {listOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Drawer de detalle */}
      {selected && (
        <LocalDrawer
          local={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Lista de locales */}
      <div className={`${styles.listPanel} ${listOpen ? styles.listOpen : ''}`} ref={listRef}>
        <div className={styles.listHandle} onClick={() => setListOpen(v => !v)} />
        <div className={styles.listScroll}>
          {filtered.length === 0 ? (
            <div className={styles.listEmpty}>
              <span>🥩</span>
              <p>No hay sangucherías con esos filtros</p>
            </div>
          ) : (
            filtered.map(l => (
              <LocalCard
                key={l.id}
                local={l}
                selected={selected?.id === l.id}
                onClick={() => handleSelectLocal(l)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
