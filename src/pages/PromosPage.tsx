import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Promocion } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { Zap, Tag, Crown, Clock, MapPin } from 'lucide-react'
import styles from './PromosPage.module.css'

const TIPO_ICONS: Record<string, string> = {
  descuento: '💸', combo: '🍽️', '2x1': '✌️',
  envio_gratis: '🛵', publicidad: '📢', destacado: '⭐',
}

export default function PromosPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const profile = useAppStore(s => s.profile)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('promociones')
      .select('*, local:locales(nombre, barrio, lat, lng)')
      .eq('activa', true)
      .order('orden')
      .then(({ data }) => { setPromos(data ?? []); setLoading(false) })
  }, [profile])

  const isPro = profile?.role === 'pro' || profile?.role === 'superadmin'

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Promos & Ofertas</h1>
          <p className={styles.pageSub}>Las mejores deals de Tucumán</p>
        </div>
        {!isPro && (
          <div className={styles.proBadge}>
            <Crown size={14} />
            PRO
          </div>
        )}
      </div>

      {!isPro && (
        <div className={styles.proBanner}>
          <Crown size={20} className={styles.proIcon} />
          <div>
            <strong>Hacete PRO</strong>
            <p>Accedé a promos exclusivas y descuentos especiales en sangucherías seleccionadas.</p>
          </div>
          <button className={styles.proBtn} onClick={() => navigate('/perfil')}>
            Ver
          </button>
        </div>
      )}

      {promos.length === 0 ? (
        <div className={styles.emptyState}>
          <span>🔥</span>
          <h3>No hay promos activas</h3>
          <p>Volvé pronto para ver las mejores ofertas</p>
        </div>
      ) : (
        <div className={styles.promoList}>
          {promos.map(p => {
            const isProOnly = p.visibilidad === 'pro'
            const locked = isProOnly && !isPro
            return (
              <div key={p.id} className={`${styles.promoCard} ${locked ? styles.locked : ''}`}>
                {isProOnly && (
                  <div className={styles.proLabel}><Crown size={11} /> PRO</div>
                )}
                {p.imagen && (
                  <img src={p.imagen} alt={p.titulo} className={styles.promoImg} />
                )}
                <div className={styles.promoBody}>
                  <div className={styles.tipoRow}>
                    <span className={styles.tipoIcon}>{TIPO_ICONS[p.tipo] ?? '🎉'}</span>
                    <span className={styles.tipoText}>{p.tipo.replace('_', ' ')}</span>
                    {p.descuento_porcentaje && (
                      <span className={styles.discountBadge}>-{p.descuento_porcentaje}%</span>
                    )}
                  </div>
                  <h3 className={styles.promoTitle}>{p.titulo}</h3>
                  {p.descripcion && !locked && (
                    <p className={styles.promoDesc}>{p.descripcion}</p>
                  )}
                  {locked && (
                    <p className={styles.lockedMsg}>
                      <Crown size={13} /> Contenido exclusivo para usuarios PRO
                    </p>
                  )}
                  {p.local?.nombre && (
                    <div className={styles.localRow}>
                      <MapPin size={12} />
                      <span>{p.local.nombre}{p.local.barrio ? ` · ${p.local.barrio}` : ''}</span>
                    </div>
                  )}
                  {p.fecha_fin && (
                    <div className={styles.fechaRow}>
                      <Clock size={12} />
                      <span>Hasta {new Date(p.fecha_fin).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                  {p.codigo_descuento && !locked && (
                    <div className={styles.codigoWrap}>
                      <Tag size={13} /> <span className={styles.codigo}>{p.codigo_descuento}</span>
                    </div>
                  )}
                  {p.local_id && !locked && (
                    <button className={styles.verLocalBtn}
                      onClick={() => navigate(`/local/${p.local_id}`)}>
                      Ver sanguchería
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
