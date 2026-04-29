import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { Heart, MessageCircle, Star, MapPin, Plus } from 'lucide-react'
import styles from './ComunidadPage.module.css'

export default function ComunidadPage() {
  const [resenas, setResenas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const profile = useAppStore(s => s.profile)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('resenas')
      .select('*, profiles(nombre), locales(nombre, barrio)')
      .eq('aprobada', true)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { setResenas(data ?? []); setLoading(false) })
  }, [])

  const labels = ['', '😞 Mala', '😐 Regular', '😊 Buena', '😄 Muy buena', '🤩 Excelente']

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Comunidad</h1>
          <p className={styles.sub}>Lo que dicen los sangucheros de Tucumán</p>
        </div>
        {profile && (
          <button className={styles.addBtn} onClick={() => navigate('/')}>
            <Plus size={16} /> Opinar
          </button>
        )}
      </div>

      {/* CTA no logueado */}
      {!profile && (
        <div className={styles.joinBanner}>
          <span className={styles.joinEmoji}>🥪</span>
          <div>
            <strong>¡Sumate a la comunidad!</strong>
            <p>Compartí tus experiencias y ayudá a otros sangucheros</p>
          </div>
          <button className={styles.joinBtn} onClick={() => navigate('/auth')}>
            Unirme
          </button>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className={styles.loadingWrap}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : resenas.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '4rem' }}>🥪</span>
          <h3>¡Sé el primero en opinar!</h3>
          <p>Encontrá una sanguchería en el mapa y dejá tu reseña</p>
          <button className={styles.joinBtn} onClick={() => navigate('/')}>
            Ir al mapa
          </button>
        </div>
      ) : (
        <div className={styles.feed}>
          {resenas.map((r, i) => (
            <div key={r.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {r.profiles?.nombre?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.userName}>{r.profiles?.nombre ?? 'Sanguchero'}</span>
                  <span className={styles.localName}>
                    <MapPin size={11} />
                    {r.locales?.nombre ?? 'Sanguchería'}
                    {r.locales?.barrio && ` · ${r.locales.barrio}`}
                  </span>
                </div>
                <div className={styles.ratingBadge}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={11}
                      fill={s < r.calificacion ? 'currentColor' : 'none'}
                      className={s < r.calificacion ? styles.starOn : styles.starOff}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.ratingLabel}>
                {labels[r.calificacion]}
              </div>

              {r.comentario && (
                <p className={styles.comment}>"{r.comentario}"</p>
              )}

              <div className={styles.cardFooter}>
                <span className={styles.time}>
                  {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
