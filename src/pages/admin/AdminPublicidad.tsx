import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminPublicidad() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('promociones')
      .select('*, local:locales(nombre)')
      .eq('tipo', 'publicidad')
      .order('orden')
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }
  useEffect(load, [])

  const save = async () => {
    if (!editing?.titulo) return
    setSaving(true)
    const { id, local, ...data } = editing
    if (id) {
      await supabase.from('promociones').update({ ...data, tipo: 'publicidad' }).eq('id', id)
    } else {
      await supabase.from('promociones').insert({ ...data, tipo: 'publicidad' })
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('promociones').delete().eq('id', id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Publicidad</h1>
          <p className={styles.pageSub}>Banners y avisos patrocinados</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setEditing({ titulo: '', descripcion: '', imagen: '', activa: true, orden: 0, visibilidad: 'todos' })}>
          <Plus size={16} /> Nuevo banner
        </button>
      </div>

      {loading ? <div className={styles.loading}><div className={styles.spinner} /></div> : (
        <div className={styles.table}>
          {items.length === 0 && <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink3)' }}>No hay publicidades cargadas</p>}
          {items.map(p => (
            <div key={p.id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowThumb}>
                  {p.imagen ? <img src={p.imagen} alt={p.titulo} className={styles.rowImg} /> : <span style={{ fontSize: '1.4rem' }}>📢</span>}
                </div>
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{p.titulo}</span>
                  <span className={styles.rowSub}>{p.local?.nombre ?? 'Sin local'} · {p.visibilidad}</span>
                  <div className={styles.rowBadges}>
                    {p.activa ? <span className={styles.badgeVerif}>Activa</span> : <span className={styles.badgeInactive}>Inactiva</span>}
                    {p.fecha_fin && <span className={styles.badgeStatus}>Vence: {new Date(p.fecha_fin).toLocaleDateString('es-AR')}</span>}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.iconBtn} onClick={() => setEditing({ ...p })}><Pencil size={15} /></button>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => del(p.id)}><Trash2 size={15} /></button>
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
              <h2>{editing.id ? 'Editar banner' : 'Nuevo banner'}</h2>
              <button className={styles.modalClose} onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formSection}>
                <div className={styles.formGrid}>
                  {[
                    { key: 'titulo', label: 'Título *', placeholder: 'Ej: Promo especial El Fortín', full: true },
                    { key: 'descripcion', label: 'Descripción', placeholder: 'Texto del aviso', full: true },
                    { key: 'imagen', label: 'URL imagen', placeholder: 'https://...', full: true },
                    { key: 'codigo_descuento', label: 'Código descuento', placeholder: 'MILA10' },
                    { key: 'orden', label: 'Orden (número)', placeholder: '0', type: 'number' },
                  ].map(({ key, label, placeholder, full, type }) => (
                    <div key={key} className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
                      <label className={styles.label}>{label}</label>
                      <input className={styles.input} type={type ?? 'text'} placeholder={placeholder}
                        value={editing[key] ?? ''}
                        onChange={e => setEditing({ ...editing, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} />
                    </div>
                  ))}
                  <div className={styles.field}>
                    <label className={styles.label}>Visibilidad</label>
                    <select className={styles.select} value={editing.visibilidad ?? 'todos'}
                      onChange={e => setEditing({ ...editing, visibilidad: e.target.value })}>
                      <option value="todos">Todos los usuarios</option>
                      <option value="pro">Solo usuarios PRO</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha de vencimiento</label>
                    <input className={styles.input} type="datetime-local"
                      value={editing.fecha_fin?.substring(0, 16) ?? ''}
                      onChange={e => setEditing({ ...editing, fecha_fin: e.target.value || null })} />
                  </div>
                </div>
              </div>
              <div className={styles.checkGrid}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" className={styles.checkInput}
                    checked={editing.activa ?? true}
                    onChange={e => setEditing({ ...editing, activa: e.target.checked })} />
                  ✅ Banner activo
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !editing.titulo}>
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
