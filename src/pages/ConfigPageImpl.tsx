import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Settings, MapPin, Sliders, Bell } from 'lucide-react'
import styles from './ConfigPage.module.css'

export default function ConfigPageImpl() {
  const { radioKm, setRadioKm, requestLocation, userLocation } = useAppStore()
  const [notif, setNotif] = useState(false)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <MapPin size={16} />
            <h2>Ubicación</h2>
          </div>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Mi ubicación</p>
              <p className={styles.rowSub}>
                {userLocation
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'No activada'}
              </p>
            </div>
            <button className={styles.btn} onClick={requestLocation}>
              Actualizar
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Sliders size={16} />
            <h2>Búsqueda</h2>
          </div>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Radio de búsqueda</p>
              <p className={styles.rowSub}>Locales cercanos en {radioKm} km</p>
            </div>
            <select
              className={styles.select}
              value={radioKm}
              onChange={e => setRadioKm(Number(e.target.value))}
            >
              {[1,2,3,5,10,50].map(v => (
                <option key={v} value={v}>{v === 50 ? 'Todo Tuc.' : `${v} km`}</option>
              ))}
            </select>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={16} />
            <h2>Notificaciones</h2>
          </div>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Nuevas promos</p>
              <p className={styles.rowSub}>Avisame cuando haya ofertas nuevas</p>
            </div>
            <button
              className={`${styles.toggle} ${notif ? styles.on : ''}`}
              onClick={() => setNotif(!notif)}
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Settings size={16} />
            <h2>Acerca de</h2>
          </div>
          <p className={styles.about}>
            <strong style={{ color: 'var(--c-gold)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              MILAPP
            </strong>{' '}
            — La base de datos más grande de sangucherías de milanesa de Tucumán.
          </p>
          <p className={styles.version}>v0.1.0</p>
        </section>
      </div>
    </div>
  )
}
