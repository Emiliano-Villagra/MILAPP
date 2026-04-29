// AdminPromos.tsx
import { useEffect, useState } from 'react'
import { supabase, type Promocion, type Local } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promocion[]>([])
  const [locales, setLocales] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Promocion> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([
      supabase.from('promociones').select('*, local:locales(nombre)').order('orden'),
      supabase.from('locales').select('id,nombre').eq('activo', true).order('nombre'),
    ]).then(([{ data: p }, { data: l }]) => {
      setPromos((p as Promocion[]) ?? [])
      setLocales((l as Local[]) ?? [])
      setLoading(false)
    })
  }
  useEffect(load, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const { id, local, ...data } = editing as any
    if (id) {
      await supabase.from('promociones').update(data).eq('id', id)
    } else {
      await supabase.from('promociones').insert(data)
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta promo?')) return
    await supabase.from('promociones').delete().eq('id', id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Promos & Publicidades</h1>
          <p className={styles.pageSub}>{promos.filter(p=>p.activa).length} activas</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setEditing({
          titulo:'', descripcion:'', tipo:'publicidad', visibilidad:'todos',
          activa:true, orden:0
        })}>
          <Plus size={16} /> Nueva promo
        </button>
      </div>

      {loading ? <div className={styles.loading}><div className={styles.spinner} /></div> : (
        <div className={styles.table}>
          {promos.map(p => (
            <div key={p.id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{p.titulo}</span>
                  <span className={styles.rowSub}>
                    {p.tipo} · {p.visibilidad}
                    {(p.local as any)?.nombre && ` · ${(p.local as any).nombre}`}
                  </span>
                  <div className={styles.rowBadges}>
                    <span className={styles.badgeStatus}>{p.tipo}</span>
                    {!p.activa && <span className={styles.badgeInactive}>Inactiva</span>}
                    {p.visibilidad === 'pro' && (
                      <span className={styles.badgeVerif}>PRO</span>
                    )}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.iconBtn} onClick={() => setEditing({ ...p })}>
                    <Pencil size={15} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => del(p.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{(editing as any).id ? 'Editar promo' : 'Nueva promo'}</h2>
              <button className={styles.modalClose} onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.field} style={{ gridColumn: '1/-1' }}>
                  <label className={styles.label}>Título *</label>
                  <input className={styles.input} value={editing.titulo??''} onChange={e=>setEditing({...editing,titulo:e.target.value})} />
                </div>
                <div className={styles.field} style={{ gridColumn: '1/-1' }}>
                  <label className={styles.label}>Descripción</label>
                  <textarea className={styles.textarea} rows={3} value={editing.descripcion??''} onChange={e=>setEditing({...editing,descripcion:e.target.value})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tipo</label>
                  <select className={styles.select} value={editing.tipo??'publicidad'} onChange={e=>setEditing({...editing,tipo:e.target.value as any})}>
                    {['descuento','combo','2x1','envio_gratis','publicidad','destacado'].map(t=>(
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Visibilidad</label>
                  <select className={styles.select} value={editing.visibilidad??'todos'} onChange={e=>setEditing({...editing,visibilidad:e.target.value as any})}>
                    <option value="todos">Todos</option>
                    <option value="pro">Solo PRO</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Local asociado</label>
                  <select className={styles.select} value={editing.local_id??''} onChange={e=>setEditing({...editing,local_id:e.target.value||undefined})}>
                    <option value="">Sin local</option>
                    {locales.map(l=><option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Código descuento</label>
                  <input className={styles.input} value={editing.codigo_descuento??''} onChange={e=>setEditing({...editing,codigo_descuento:e.target.value||null})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>% Descuento</label>
                  <input className={styles.input} type="number" value={editing.descuento_porcentaje??''} onChange={e=>setEditing({...editing,descuento_porcentaje:parseFloat(e.target.value)||null})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha fin</label>
                  <input className={styles.input} type="datetime-local" value={editing.fecha_fin?.substring(0,16)??''} onChange={e=>setEditing({...editing,fecha_fin:e.target.value||null})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>URL imagen</label>
                  <input className={styles.input} value={editing.imagen??''} onChange={e=>setEditing({...editing,imagen:e.target.value||null})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Orden</label>
                  <input className={styles.input} type="number" value={editing.orden??0} onChange={e=>setEditing({...editing,orden:parseInt(e.target.value)||0})} />
                </div>
              </div>
              <div className={styles.checkboxRow}>
                <label className={styles.checkbox}>
                  <input type="checkbox" checked={editing.activa??true} onChange={e=>setEditing({...editing,activa:e.target.checked})} />
                  Activa
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={save} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
