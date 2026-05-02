import { type Local } from '@/lib/supabase'
import { formatDistance } from '@/lib/utils'
import { Star, Bike, BadgeCheck, MapPin, Clock } from 'lucide-react'
import { isAbierto } from '@/lib/utils'
import styles from './LocalCard.module.css'

interface Props {
  local: Local
  selected?: boolean
  onClick: () => void
}

export default function LocalCard({ local, selected, onClick }: Props) {
  const abierto = isAbierto(local.horario_apertura, local.horario_cierre, local.dias_abierto)

  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.thumb}>
        {local.foto_portada
          ? <img src={local.foto_portada} alt={local.nombre} className={styles.thumbImg} />
          : <span className={styles.thumbEmoji}>🥩</span>
        }
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.nombre}>{local.nombre}</span>
          <div className={styles.badges}>
            {local.verificado && <BadgeCheck size={13} className={styles.verifiedIcon} />}
            {local.tiene_delivery && <Bike size={13} className={styles.deliveryIcon} />}
          </div>
        </div>

        <span className={styles.addr}>
          <MapPin size={11} />
          {local.barrio ?? local.direccion}
        </span>

        <div className={styles.footer}>
          <span className={`${styles.status} ${abierto ? styles.open : styles.closed}`}>
            <Clock size={10} /> {abierto ? 'Abierto' : 'Cerrado'}
          </span>
          {(local.calificacion_promedio ?? 0) > 0 && (
            <span className={styles.rating}>
              <Star size={11} fill="currentColor" className={styles.star} />
              {local.calificacion_promedio?.toFixed(1)}
            </span>
          )}
          {local.distancia != null && (
            <span className={styles.dist}>
              📍 {formatDistance(local.distancia)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
