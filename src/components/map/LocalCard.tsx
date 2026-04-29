import { type Local } from '@/lib/supabase'
import { formatDistance } from '@/lib/utils'
import { Star, Bike, BadgeCheck, MapPin } from 'lucide-react'
import styles from './LocalCard.module.css'

interface Props {
  local: Local
  selected?: boolean
  onClick: () => void
}

export default function LocalCard({ local, selected, onClick }: Props) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.left}>
        {local.foto_portada ? (
          <img src={local.foto_portada} alt={local.nombre} className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder}>🥩</div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.header}>
          <span className={styles.nombre}>{local.nombre}</span>
          <div className={styles.badges}>
            {local.verificado && <BadgeCheck size={13} className={styles.verified} />}
            {local.tiene_delivery && <Bike size={13} className={styles.delivery} />}
          </div>
        </div>

        <span className={styles.direccion}>
          <MapPin size={11} /> {local.barrio ?? local.direccion}
        </span>

        <div className={styles.footer}>
          {local.calificacion_promedio > 0 && (
            <span className={styles.rating}>
              <Star size={11} fill="currentColor" />
              {local.calificacion_promedio.toFixed(1)}
              <span className={styles.ratingCount}>({local.total_resenas})</span>
            </span>
          )}
          {local.precio_promedio && (
            <span className={styles.precio}>
              ${Math.round(local.precio_promedio / 100) * 100}
            </span>
          )}
          {local.distancia != null && (
            <span className={styles.distancia}>
              📍 {formatDistance(local.distancia)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
