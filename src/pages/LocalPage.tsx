import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Local, type Producto, type Resena } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { getDirectionsUrl, formatDistance, formatHorario, isAbierto } from '@/lib/utils'
import {
  ArrowLeft, Navigation, Phone, Instagram, Bike,
  BadgeCheck, Star, Clock, MapPin, Heart, Globe
} from 'lucide-react'
import styles from './LocalPage.module.css'

export default function LocalPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAppStore(s => s.profile)
  const userLocation = useAppStore(s => s.userLocation)

  const [local, setLocal] = useState<Local | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [resenas, setResenas] = useState<Resena[]>([])
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(true)

  // Nueva reseña
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('locales').select('*').eq('id', id).single(),
      supabase.from('productos').select('*').eq('local_id', id).eq('disponible', true),
      supabase.from('resenas').select('*, profiles(nombre,avatar_url)').eq('local_id', id).eq('aprobada', true),
    ]).then(([{ data: l }, { data: p }, { data: r }]) => {
      setLocal(l as Local)
      setProductos((p as Producto[]) ?? [])
      setResenas((r as Resena[]) ?? [])
      setLoading(false)
    })

    if (profile) {
      supabase.from('favoritos').select('id').eq('user_id', profile.id).eq('local_id', id).single()
        .then(({ data }) => setIsFav(!!data))
    }
  }, [id, profile])

  const toggleFav = async () => {
    if (!profile) { navigate('/auth'); return }
    if (!local) return
    if (isFav) {
      await supabase.from('favoritos').delete().eq('user_id', profile.id).eq('local_id', local.id)
      setIsFav(false)
    } else {
      await supabase.from('favoritos').insert({ user_id: profile.id, local_id: local.id })
      setIsFav(true)
    }
  }

  const submitResena = async () => {
    if (!profile || !local || myRating === 0) return
    setSubmitting(true)
    await supabase.from('resenas').upsert({
      local_id: local.id, user_id: profile.id,
      calificacion: myRating, comentario: myComment,
    })
    setSubmitting(false)
    setMyComment('')
    alert('¡Reseña enviada! Se publicará después de ser aprobada.')
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }
  if (!local) return <div className={styles.loading}>Local no encontrado</div>

  const abierto = isAbierto(local.horario_apertura, local.horario_cierre, local.dias_abierto)
  const distancia = userLocation ? Math.round(
    ((lat1, lng1, lat2, lng2) => {
      const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    })(userLocation.lat, userLocation.lng, local.lat, local.lng) * 10
  ) / 10 : null

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        {local.foto_portada ? (
          <img src={local.foto_portada} alt={local.nombre} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>🥩</div>
        )}
        <div className={styles.heroOverlay}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <button
            className={`${styles.favBtn} ${isFav ? styles.faved : ''}`}
            onClick={toggleFav}
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Info principal */}
        <div className={styles.mainInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.nombre}>{local.nombre}</h1>
            <div className={styles.badges}>
              {local.verificado && <BadgeCheck size={16} className={styles.verified} />}
              {local.tiene_delivery && <Bike size={16} className={styles.delivery} />}
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={`${styles.statusChip} ${abierto ? styles.open : styles.closed}`}>
              <Clock size={11} /> {abierto ? 'Abierto ahora' : 'Cerrado'}
            </span>
            {local.horario_apertura && (
              <span className={styles.horario}>
                {formatHorario(local.horario_apertura, local.horario_cierre)}
              </span>
            )}
          </div>

          {local.calificacion_promedio > 0 && (
            <div className={styles.rating}>
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i} size={16}
                  fill={i <= Math.round(local.calificacion_promedio) ? 'var(--c-gold)' : 'none'}
                  color={i <= Math.round(local.calificacion_promedio) ? 'var(--c-gold)' : 'var(--c-border2)'}
                />
              ))}
              <span className={styles.ratingVal}>{local.calificacion_promedio.toFixed(1)}</span>
              <span className={styles.ratingCount}>({local.total_resenas})</span>
            </div>
          )}

          <div className={styles.addrRow}>
            <MapPin size={14} className={styles.addrIcon} />
            <div>
              <p>{local.direccion}</p>
              {local.barrio && <p className={styles.barrio}>{local.barrio}</p>}
              {distancia && (
                <p className={styles.distancia}>📍 {formatDistance(distancia)}</p>
              )}
            </div>
          </div>

          {local.descripcion && <p className={styles.desc}>{local.descripcion}</p>}

          {local.tags && (
            <div className={styles.tags}>
              {local.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className={styles.ctas}>
          <button
            className={styles.ctaPrimary}
            onClick={() => window.open(getDirectionsUrl(local.lat, local.lng, local.nombre), '_blank')}
          >
            <Navigation size={16} /> Cómo llegar
          </button>
          {local.telefono && (
            <a href={`tel:${local.telefono}`} className={styles.ctaIcon}><Phone size={16} /></a>
          )}
          {local.whatsapp && (
            <a href={`https://wa.me/${local.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className={`${styles.ctaIcon} ${styles.ctaWa}`}>WA</a>
          )}
          {local.instagram && (
            <a href={`https://instagram.com/${local.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
              className={styles.ctaIcon}><Instagram size={16} /></a>
          )}
          {local.sitio_web && (
            <a href={local.sitio_web} target="_blank" rel="noreferrer"
              className={styles.ctaIcon}><Globe size={16} /></a>
          )}
        </div>

        {/* Menú */}
        {productos.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Menú</h2>
            <div className={styles.menuGrid}>
              {productos.map(p => (
                <div key={p.id} className={`${styles.menuCard} ${p.es_destacado ? styles.destacado : ''}`}>
                  {p.foto && <img src={p.foto} alt={p.nombre} className={styles.menuImg} />}
                  <div className={styles.menuInfo}>
                    <span className={styles.menuNombre}>{p.nombre}</span>
                    {p.descripcion && <span className={styles.menuDesc}>{p.descripcion}</span>}
                  </div>
                  {p.precio && (
                    <span className={styles.menuPrecio}>${p.precio.toLocaleString('es-AR')}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reseñas */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reseñas ({resenas.length})</h2>

          {/* Nueva reseña */}
          {profile && (
            <div className={styles.newResena}>
              <p className={styles.ratingPrompt}>¿Cómo estuvo?</p>
              <div className={styles.starPicker}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} className={styles.starPickerBtn} onClick={() => setMyRating(i)}>
                    <Star
                      size={24}
                      fill={i <= myRating ? 'var(--c-gold)' : 'none'}
                      color={i <= myRating ? 'var(--c-gold)' : 'var(--c-border2)'}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className={styles.commentInput}
                placeholder="Contanos cómo estuvo la mila..."
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                rows={3}
              />
              <button
                className={styles.submitResena}
                onClick={submitResena}
                disabled={myRating === 0 || submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </div>
          )}

          {resenas.length === 0 ? (
            <p className={styles.noResenas}>Todavía no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <div className={styles.resenasList}>
              {resenas.map(r => (
                <div key={r.id} className={styles.resenaCard}>
                  <div className={styles.resenaHeader}>
                    <div className={styles.resenaAvatar}>
                      {(r.profiles as any)?.nombre?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className={styles.resenaNombre}>{(r.profiles as any)?.nombre ?? 'Anónimo'}</p>
                      <div className={styles.resenaStars}>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={12}
                            fill={i <= r.calificacion ? 'var(--c-gold)' : 'none'}
                            color={i <= r.calificacion ? 'var(--c-gold)' : 'var(--c-border2)'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comentario && <p className={styles.resenaComment}>{r.comentario}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
