// AdminResenas.tsx
import { useEffect, useState } from 'react'
import { supabase, type Resena } from '@/lib/supabase'
import { Check, Trash2, Star } from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminResenas() {
  const [resenas, setResenas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending')

  const load = () => {
    supabase.from('resenas')
      .select('*, profiles(nombre,email), locales(nombre)')
      .eq('aprobada', filter === 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setResenas(data ?? []); setLoading(false) })
  }
  useEffect(() => { setLoading(true); load() }, [filter])

  const approve = async (id: string) => {
    await supabase.from('resenas').update({ aprobada: true }).eq('id', id)
    load()
  }
  const del = async (id: string) => {
    if (!confirm('¿Eliminar reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reseñas</h1>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {(['pending','approved'] as const).map(f => (
            <button
              key={f}
              className={filter === f ? styles.btnPrimary : styles.btnSecondary}
              onClick={() => setFilter(f)}
            >
              {f === 'pending' ? 'Pendientes' : 'Aprobadas'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className={styles.loading}><div className={styles.spinner} /></div> : (
        <div className={styles.table}>
          {resenas.length === 0 && (
            <p style={{ color:'var(--c-text3)', textAlign:'center', padding:'40px' }}>
              No hay reseñas {filter === 'pending' ? 'pendientes' : 'aprobadas'}
            </p>
          )}
          {resenas.map(r => (
            <div key={r.id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{r.locales?.nombre ?? 'Local desconocido'}</span>
                  <span className={styles.rowSub}>
                    {r.profiles?.nombre ?? r.profiles?.email ?? 'Anónimo'} ·{' '}
                    {[1,2,3,4,5].map(i => i <= r.calificacion ? '★' : '☆').join('')}
                  </span>
                  {r.comentario && <p style={{ fontSize:'0.8rem', color:'var(--c-text2)', marginTop:'4px' }}>{r.comentario}</p>}
                </div>
                <div className={styles.rowActions}>
                  {filter === 'pending' && (
                    <button className={styles.iconBtn} onClick={() => approve(r.id)} title="Aprobar">
                      <Check size={15} className={styles.verified} />
                    </button>
                  )}
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => del(r.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
