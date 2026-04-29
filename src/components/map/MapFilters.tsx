import { Search, Bike, BadgeCheck, SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import styles from './MapFilters.module.css'

export default function MapFilters() {
  const {
    searchQuery, setSearchQuery,
    soloDelivery, setSoloDelivery,
    soloVerificados, setSoloVerificados,
    radioKm, setRadioKm,
    userLocation,
  } = useAppStore()

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.search}
          placeholder="Buscar por nombre, barrio, tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${soloDelivery ? styles.active : ''}`}
          onClick={() => setSoloDelivery(!soloDelivery)}
        >
          <Bike size={13} /> Delivery
        </button>
        <button
          className={`${styles.chip} ${soloVerificados ? styles.active : ''}`}
          onClick={() => setSoloVerificados(!soloVerificados)}
        >
          <BadgeCheck size={13} /> Verificados
        </button>
        {userLocation && (
          <select
            className={styles.radioPicker}
            value={radioKm}
            onChange={(e) => setRadioKm(Number(e.target.value))}
          >
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={50}>Todo Tucumán</option>
          </select>
        )}
      </div>
    </div>
  )
}
