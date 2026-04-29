import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Local, type Producto } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { getDirectionsUrl, formatDistance, formatHorario, isAbierto } from '@/lib/utils'
import {
  X, Navigation, Phone, Instagram, Bike,
  BadgeCheck, Star, Clock, MapPin, Heart, ChevronRight, Send
} from 'lucide-react'
import styles from './LocalDrawer.module.css'

interface Props {
  local: Local
  onClose: () => void
}

export default function LocalDrawer({ local, onClose }: Props) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [isFav, setIsFav] = useState(false)
  const [tab, setTab] = useState<'info' | 'resenas'>('info')
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const profile = useAppStore((s) => s.profile)
  const navigate = useNavigate()
  const abierto = isAbierto(local.horario_apertura, local.horario_cierre, local.dias_abierto)

  useEffect(() => {
    setTab('info')
    setMyRating(0)
    setMyComment('')
    setSubmitted(false)

    supabase.from('productos')
      .select('*').eq('local_id', local.id).eq('disponible', true)
      .then(({ data }) => setProductos((data as Producto[]) ?? []))

    supabase.from('resenas')
      .select('*, profiles(nombre)')
      .eq('local_id', local.id)
      .eq('aprobada', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setResenas(data ?? []))

    if (profile) {
      supabase.from('favoritos')
        .select('id').eq('user_id', profile.id).eq('local_id', local.id)
        .maybeSingle()
        .then(({ data }) => setIsFav(!!data))
    }
  }, [local.id, profile])

  const toggleFav = async () => {
    if (!profile) { navigate('/auth'); return }
    if (isFav) {
      await supabase.from('favoritos').delete().eq('user_id', profile.id).eq('local_id', local.id)
      setIsFav(false)
    } else {
      await supabase.from('favoritos').insert({ user_id: profile.id, local_id: local.id })
      setIsFav(true)
    }
  }

  const submitResena = async () => {
    if (!profile || myRating === 0) return
    setSubmitting(true)
    await supabase.from('resenas').upsert({
      local_id: local.id,
      user_id: profile.id,
      calificacion: myRating,
      comentario: myComment || null,
      aprobada: false,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  const renderStars = (rating: number, size = 14) =>
    [1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size}
        fill={i <= rating ? 'currentColor' : 'none'}
        className={i <= rating ? styles.starOn : styles.starOff}
      />
    ))

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.drawer} animate-slide-up`}>
        <div className={styles.handleBar} />

        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerInfo}>
              <h2 className={styles.nombre}>{local.nombre}</h2>
              <div className={styles.headerMeta}>
                {local.verificado && (
                  <span className={styles.verified}><BadgeCheck size={12} /> Verificado</span>
                )}
                <span className={`${styles.status} ${abierto ? styles.open : styles.closed}`}>
                  <Clock size={11} /> {abierto ? 'Abierto' : 'Cerrado'}
                </span>
                {local.tiene_delivery && (
                  <span className={styles.deliveryBadge}><Bike size={11} /> Delivery</span>
                )}
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={`${styles.iconBtn} ${isFav ? styles.faved : ''}`} onClick={toggleFav}>
                <Heart size={17} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <button className={styles.iconBtn} onClick={onClose}>
                <X size={17} />
              </button>
            </div>
          </div>

          {local.calificacion_promedio > 0 && (
            <div className={styles.ratingRow}>
              <div className={styles.stars}>{renderStars(Math.round(local.calificacion_promedio))}</div>
              <span className={styles.ratingVal}>{local.calificacion_promedio.toFixed(1)}</span>
              <span className={styles.ratingCount}>({local.total_resenas} opiniones)</span>
            </div>
          )}

          <div className={styles.ctas}>
            <button className={styles.ctaPrimary}
              onClick={() => window.open(getDirectionsUrl(local.lat, local.lng, local.nombre), '_blank')}>
              <Navigation size={15} /> Cómo llegar
            </button>
            {local.telefono && (
              <a href={`tel:${local.telefono}`} className={styles.ctaIcon}><Phone size={15} /></a>
            )}
            {local.whatsapp && (
              <a href={`https://wa.me/${local.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer" className={`${styles.ctaIcon} ${styles.ctaWa}`}>WA</a>
            )}
            {local.instagram && (
              <a href={`https://instagram.com/${local.instagram.replace('@', '')}`}
                target="_blank" rel="noreferrer" className={styles.ctaIcon}><Instagram size={15} /></a>
            )}
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'info' ? styles.tabActive : ''}`}
              onClick={() => setTab('info')}>Info</button>
            <button className={`${styles.tab} ${tab === 'resenas' ? styles.tabActive : ''}`}
              onClick={() => setTab('resenas')}>
              Opiniones {resenas.length > 0 && `(${resenas.length})`}
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {tab === 'info' && (
            <>
              <div className={styles.addrRow}>
                <MapPin size={14} className={styles.addrIcon} />
                <div>
                  <p className={styles.addr}>{local.direccion}</p>
                  {local.barrio && <p className={styles.barrio}>{local.barrio}</p>}
                  {local.distancia != null && <p className={styles.dist}>📍 {formatDistance(local.distancia)}</p>}
                </div>
              </div>
              {local.horario_apertura && (
                <div className={styles.addrRow}>
                  <Clock size={14} className={styles.addrIcon} />
                  <p className={styles.addr}>{formatHorario(local.horario_apertura, local.horario_cierre)}</p>
                </div>
              )}
              {local.tags && local.tags.length > 0 && (
                <div className={styles.tags}>
                  {local.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              )}
              {local.descripcion && <p className={styles.desc}>{local.descripcion}</p>}
              {productos.length > 0 && (
                <div className={styles.menu}>
                  <h3 className={styles.menuTitle}>Menú</h3>
                  {productos.map(p => (
                    <div key={p.id} className={`${styles.menuItem} ${p.es_destacado ? styles.menuDestacado : ''}`}>
                      <div>
                        <span className={styles.menuNombre}>{p.nombre}</span>
                        {p.descripcion && <span className={styles.menuDesc}>{p.descripcion}</span>}
                      </div>
                      {p.precio && <span className={styles.menuPrecio}>${p.precio.toLocaleString('es-AR')}</span>}
                    </div>
                  ))}
                </div>
              )}
              <button className={styles.verMas} onClick={() => navigate(`/local/${local.id}`)}>
                Ver ficha completa <ChevronRight size={15} />
              </button>
            </>
          )}

          {tab === 'resenas' && (
            <>
              {profile ? (
                submitted ? (
                  <div className={styles.submittedMsg}>
                    ✅ ¡Gracias por tu opinión! Se publicará después de ser revisada.
                  </div>
                ) : (
                  <div className={styles.newResena}>
                    <p className={styles.newResenaTitle}>¿Cómo estuvo la mila?</p>
                    <div className={styles.starPicker}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} className={styles.starPickerBtn}
                          onMouseEnter={() => setHoveredStar(i)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setMyRating(i)}>
                          <Star size={32}
                            fill={(hoveredStar || myRating) >= i ? 'currentColor' : 'none'}
                            className={(hoveredStar || myRating) >= i ? styles.starPickerOn : styles.starPickerOff}
                          />
                        </button>
                      ))}
                    </div>
                    {myRating > 0 && (
                      <p className={styles.ratingLabel}>
                        {['','😞 Mala','😐 Regular','😊 Buena','😄 Muy buena','🤩 Excelente'][myRating]}
                      </p>
                    )}
                    <textarea className={styles.commentInput}
                      placeholder="Contanos cómo estuvo... (opcional)"
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      rows={3}
                    />
                    <button className={styles.submitBtn}
                      onClick={submitResena}
                      disabled={myRating === 0 || submitting}>
                      <Send size={14} />
                      {submitting ? 'Enviando...' : 'Enviar opinión'}
                    </button>
                  </div>
                )
              ) : (
                <button className={styles.loginToReview} onClick={() => navigate('/auth')}>
                  <Star size={16} /> Ingresá para dejar tu opinión
                </button>
              )}

              {resenas.length === 0 ? (
                <p className={styles.noResenas}>Todavía no hay opiniones. ¡Sé el primero!</p>
              ) : (
                <div className={styles.resenasList}>
                  {resenas.map(r => (
                    <div key={r.id} className={styles.resenaCard}>
                      <div className={styles.resenaHeader}>
                        <div className={styles.resenaAvatar}>
                          {r.profiles?.nombre?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className={styles.resenaNombre}>{r.profiles?.nombre ?? 'Usuario'}</p>
                          <div className={styles.resenaStars}>{renderStars(r.calificacion, 12)}</div>
                        </div>
                      </div>
                      {r.comentario && <p className={styles.resenaComment}>{r.comentario}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
