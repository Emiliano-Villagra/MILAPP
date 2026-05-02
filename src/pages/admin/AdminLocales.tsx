import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, BadgeCheck, Bike, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import styles from './AdminPage.module.css'

const EMPTY: any = {
  nombre: '', direccion: '', barrio: '', descripcion: '',
  lat: -26.8241, lng: -65.2226,
  telefono: '', whatsapp: '', instagram: '', sitio_web: '',
  horario_apertura: '', horario_cierre: '',
  precio_promedio: '',
  tiene_delivery: false, tiene_local_fisico: true,
  activo: true, verificado: false,
  tags: '',
}

export default function AdminLocales() {
  const [locales, setLocales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => {
    supabase.from('locales').select('*').order('nombre')
      .then(({ data }) => { setLocales(data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing || !editing.nombre || !editing.direccion) return
    setSaving(true)
    const { id, ...data } = editing
    const payload = {
      ...data,
      tags: typeof data.tags === 'string'
        ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : data.tags,
      precio_promedio: data.precio_promedio ? Number(data.precio_promedio) : null,
      lat: Number(data.lat),
      lng: Number(data.lng),
    }
    if (id) {
      await supabase.from('locales').update(payload).eq('id', id)
    } else {
      await supabase.from('locales').insert(payload)
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar sanguchería? Esta acción no se puede deshacer.')) return
    await supabase.from('locales').delete().eq('id', id)
    load()
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('locales').update({ activo: !activo }).eq('id', id)
    setLocales(ls => ls.map(l => l.id === id ? { ...l, activo: !activo } : l))
  }

  const filtered = locales.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.nombre.toLowerCase().includes(q) || (l.barrio ?? '').toLowerCase().includes(q)
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sangucherías</h1>
          <p className={styles.pageSub}>{locales.filter(l => l.activo).length} activas · {locales.length} totales</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input className={styles.searchInput} placeholder="Buscar por nombre o barrio..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : (
        <div className={styles.table}>
          {filtered.map(l => (
            <div key={l.id} className={`${styles.row} ${!l.activo ? styles.inactive : ''}`}>
              <div className={styles.rowMain}>
                <div className={styles.rowInfo}>
                  <div className={styles.rowNameRow}>
                    <span className={styles.rowName}>{l.nombre}</span>
                    <div className={styles.badgesRow}>
                      {l.verificado && <BadgeCheck size={13} className={styles.verifiedIcon} />}
                      {l.tiene_delivery && <Bike size={13} className={styles.deliveryIcon} />}
                      {!l.activo && <span className={styles.inactiveBadge}>Inactivo</span>}
                    </div>
                  </div>
                  <span className={styles.rowSub}>{l.direccion}{l.barrio ? ` · ${l.barrio}` : ''}</span>
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.iconBtn} title={l.activo ? 'Desactivar' : 'Activar'}
                    onClick={() => toggleActivo(l.id, l.activo)}>
                    {l.activo ? <ToggleRight size={18} className={styles.activeIcon} /> : <ToggleLeft size={18} />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditing({
                    ...l, tags: (l.tags ?? []).join(', ')
                  })}>
                    <Pencil size={14} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => del(l.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing.id ? 'Editar sanguchería' : 'Nueva sanguchería'}</h2>
              <button className={styles.modalClose} onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.colFull}`}>
                  <label className={styles.label}>Nombre *</label>
                  <input className={styles.input} value={editing.nombre}
                    onChange={e => setEditing({ ...editing, nombre: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.colFull}`}>
                  <label className={styles.label}>Dirección *</label>
                  <input className={styles.input} value={editing.direccion}
                    onChange={e => setEditing({ ...editing, direccion: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Barrio</label>
                  <input className={styles.input} value={editing.barrio ?? ''}
                    onChange={e => setEditing({ ...editing, barrio: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Precio promedio ($)</label>
                  <input className={styles.input} type="number" value={editing.precio_promedio ?? ''}
                    onChange={e => setEditing({ ...editing, precio_promedio: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Latitud</label>
                  <input className={styles.input} type="number" step="any" value={editing.lat}
                    onChange={e => setEditing({ ...editing, lat: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Longitud</label>
                  <input className={styles.input} type="number" step="any" value={editing.lng}
                    onChange={e => setEditing({ ...editing, lng: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Abre</label>
                  <input className={styles.input} type="time" value={editing.horario_apertura ?? ''}
                    onChange={e => setEditing({ ...editing, horario_apertura: e.target.value || null })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cierra</label>
                  <input className={styles.input} type="time" value={editing.horario_cierre ?? ''}
                    onChange={e => setEditing({ ...editing, horario_cierre: e.target.value || null })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Teléfono</label>
                  <input className={styles.input} value={editing.telefono ?? ''}
                    onChange={e => setEditing({ ...editing, telefono: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>WhatsApp</label>
                  <input className={styles.input} value={editing.whatsapp ?? ''}
                    onChange={e => setEditing({ ...editing, whatsapp: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Instagram</label>
                  <input className={styles.input} value={editing.instagram ?? ''}
                    onChange={e => setEditing({ ...editing, instagram: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sitio web</label>
                  <input className={styles.input} value={editing.sitio_web ?? ''}
                    onChange={e => setEditing({ ...editing, sitio_web: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.colFull}`}>
                  <label className={styles.label}>Tags (separados por coma)</label>
                  <input className={styles.input} value={editing.tags ?? ''}
                    placeholder="crujiente, casera, delivery rápido"
                    onChange={e => setEditing({ ...editing, tags: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.colFull}`}>
                  <label className={styles.label}>Descripción</label>
                  <textarea className={styles.textarea} rows={3} value={editing.descripcion ?? ''}
                    onChange={e => setEditing({ ...editing, descripcion: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.colFull}`}>
                  <label className={styles.label}>URL Foto portada</label>
                  <input className={styles.input} value={editing.foto_portada ?? ''}
                    onChange={e => setEditing({ ...editing, foto_portada: e.target.value })} />
                </div>
              </div>

              <div className={styles.checkboxGrid}>
                {[
                  ['activo', 'Activo'],
                  ['verificado', 'Verificado'],
                  ['tiene_delivery', 'Delivery'],
                  ['tiene_local_fisico', 'Local físico'],
                ].map(([key, label]) => (
                  <label key={key} className={styles.checkbox}>
                    <input type="checkbox"
                      checked={!!editing[key]}
                      onChange={e => setEditing({ ...editing, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={save}
                  disabled={saving || !editing.nombre || !editing.direccion}>
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
