import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Local } from '@/lib/supabase'
import { Star, MapPin, Bike, BadgeCheck, Trophy } from 'lucide-react'
import styles from './ElegidosPage.module.css'

export default function ElegidosPage() {
  const [locales, setLocales] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('locales').select('*')
      .eq('activo', true)
      .gte('total_resenas', 0)
      .order('calificacion_promedio', { ascending: false })
      .order('total_resenas', { ascending: false })
      .limit(20)
      .then(({ data }) => { setLocales((data as Local[]) ?? []); setLoading(false) })
  }, [])

  const medals = ['🥇', '🥈', '🥉']
  const podiumColors = ['#F2B749', '#C0C0C0', '#CD7F32']

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>👑</div>
        <h1 className={styles.heroTitle}>Los Elegidos</h1>
        <p className={styles.heroSub}>Las mejores sangucherías de Tucumán según la comunidad</p>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : locales.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: '3rem' }}>🥪</span>
          <p>Todavía no hay suficientes reseñas para el ranking</p>
        </div>
      ) : (
        <>
          {/* Podio top 3 */}
          {locales.length >= 3 && (
            <div className={styles.podium}>
              {[locales[1], locales[0], locales[2]].map((local, i) => {
                const rank = i === 1 ? 1 : i === 0 ? 2 : 3
                return (
                  <div key={local.id}
                    className={`${styles.podiumItem} ${rank === 1 ? styles.podiumFirst : ''}`}
                    onClick={() => navigate(`/local/${local.id}`)}>
                    <div className={styles.podiumMedal} style={{ color: podiumColors[rank - 1] }}>
                      {medals[rank - 1]}
                    </div>
                    <div className={styles.podiumThumb}>
                      {local.foto_portada
                        ? <img src={local.foto_portada} alt={local.nombre} />
                        : <span>🥪</span>
                      }
                    </div>
                    <p className={styles.podiumName}>{local.nombre}</p>
                    <div className={styles.podiumRating}>
                      <Star size={12} fill="currentColor" style={{ color: 'var(--orange)' }} />
                      <span>{local.calificacion_promedio > 0 ? local.calificacion_promedio.toFixed(1) : '—'}</span>
                    </div>
                    <div className={styles.podiumBar} style={{
                      height: rank === 1 ? 60 : rank === 2 ? 44 : 32,
                      background: podiumColors[rank - 1]
                    }} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <div className={styles.list}>
            {locales.map((local, i) => (
              <div key={local.id} className={styles.item}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(`/local/${local.id}`)}>
                <div className={`${styles.rank} ${i < 3 ? styles.rankTop : ''}`}>
                  {i < 3 ? medals[i] : <span>#{i + 1}</span>}
                </div>
                <div className={styles.thumb}>
                  {local.foto_portada
                    ? <img src={local.foto_portada} alt={local.nombre} />
                    : <span>🥪</span>
                  }
                </div>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{local.nombre}</span>
                    {local.verificado && <BadgeCheck size={13} className={styles.verified} />}
                    {local.tiene_delivery && <Bike size={13} className={styles.delivery} />}
                  </div>
                  <span className={styles.location}>
                    <MapPin size={11} /> {local.barrio ?? local.direccion}
                  </span>
                  <div className={styles.tags}>
                    {local.tags?.slice(0, 2).map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreVal}>
                    {local.calificacion_promedio > 0 ? local.calificacion_promedio.toFixed(1) : '—'}
                  </div>
                  <div className={styles.scoreStars}>
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={10}
                        fill={s < Math.round(local.calificacion_promedio) ? 'currentColor' : 'none'}
                        style={{ color: s < Math.round(local.calificacion_promedio) ? 'var(--orange)' : 'var(--border2)' }}
                      />
                    ))}
                  </div>
                  <span className={styles.scoreCount}>{local.total_resenas} op.</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
