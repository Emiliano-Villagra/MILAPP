import { useEffect, useState, useRef } from 'react'
import { supabase, type Local } from '@/lib/supabase'
import { Plus, Pencil, Trash2, BadgeCheck, Search, X, Bike, MapPin, Save } from 'lucide-react'
import styles from './AdminPage.module.css'

const EMPTY: Partial<Local> = {
  nombre: '', descripcion: '', direccion: '', barrio: '',
  ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán',
  telefono: '', whatsapp: '', instagram: '',
  lat: -26.8241, lng: -65.2226,
  horario_apertura: null, horario_cierre: null,
  precio_promedio: null,
  tiene_delivery: false, tiene_local_fisico: true,
  activo: true, verificado: false,
  foto_portada: null, tags: [],
}

export default function AdminLocales() {
  const [locales, setLocales] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Partial<Local> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  const load = () => {
    supabase.from('locales').select('*').order('nombre')
      .then(({ data }) => { setLocales((data as Local[]) ?? []); setLoading(false) })
  }
  useEffect(load, [])

  const filtered = locales.filter(l =>
    l.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (l.barrio ?? '').toLowerCase().includes(search.toLowerCase()) ||
    l.direccion.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditing({ ...EMPTY })
    setTagsInput('')
  }

  const openEdit = (l: Local) => {
    setEditing({ ...l })
    setTagsInput(l.tags?.join(', ') ?? '')
  }

  const save = async () => {
    if (!editing || !editing.nombre || !editing.direccion) return
    setSaving(true)
    const payload = {
      ...editing,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    if (editing.id) {
      await supabase.from('locales').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('locales').insert(payload)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta sanguchería?')) return
    await supabase.from('locales').update({ activo: false }).eq('id', id)
    load()
  }

  const toggleVerif = async (l: Local) => {
    await supabase.from('locales').update({ verificado: !l.verificado }).eq('id', l.id)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sangucherías</h1>
          <p className={styles.pageSub}>{locales.filter(l => l.activo).length} activas · {locales.filter(l => !l.activo).length} inactivas</p>
        </div>
        <button className={styles.btnPrimary} onClick={openNew}>
          <Plus size={16} /> Nueva sanguchería
        </button>
      </div>

      <div className={styles.searchBar}>
        <Search size={15} className={styles.searchIcon} />
        <input className={styles.search} placeholder="Buscar por nombre, barrio..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : (
        <div className={styles.table}>
          {filtered.length === 0 && (
            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink3)' }}>
              No hay resultados
            </p>
          )}
          {filtered.map(l => (
            <div key={l.id} className={`${styles.row} ${!l.activo ? styles.rowInactive : ''}`}>
              <div className={styles.rowMain}>
                <div className={styles.rowThumb}>
                  {l.foto_portada
                    ? <img src={l.foto_portada} alt={l.nombre} className={styles.rowImg} />
                    : <span style={{ fontSize: '1.4rem' }}>🥪</span>
                  }
                </div>
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{l.nombre}</span>
                  <span className={styles.rowSub}>
                    <MapPin size={11} /> {l.barrio ? `${l.barrio} · ` : ''}{l.direccion}
                  </span>
                  <div className={styles.rowBadges}>
                    {l.verificado && <span className={styles.badgeVerif}>✓ Verificado</span>}
                    {l.tiene_delivery && <span className={styles.badgeDelivery}>🛵 Delivery</span>}
                    {!l.activo && <span className={styles.badgeInactive}>Inactivo</span>}
                    {l.calificacion_promedio > 0 && (
                      <span className={styles.badgeRating}>⭐ {l.calificacion_promedio.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button className={`${styles.iconBtn} ${l.verificado ? styles.iconBtnActive : ''}`}
                    onClick={() => toggleVerif(l)} title="Toggle verificado">
                    <BadgeCheck size={15} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => openEdit(l)}>
                    <Pencil size={15} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => del(l.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing.id ? `Editando: ${editing.nombre}` : '+ Nueva sanguchería'}</h2>
              <button className={styles.modalClose} onClick={() => setEditing(null)}><X size={18} /></button>
            </div>

            <div className={styles.modalBody}>
              {/* Sección básica */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>📍 Información básica</h3>
                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Nombre *</label>
                    <input className={styles.input} placeholder="Ej: La Sanguchería del Centro"
                      value={editing.nombre ?? ''} onChange={e => setEditing({ ...editing, nombre: e.target.value })} />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Descripción</label>
                    <textarea className={styles.textarea} rows={2}
                      placeholder="Breve descripción del local..."
                      value={editing.descripcion ?? ''}
                      onChange={e => setEditing({ ...editing, descripcion: e.target.value })} />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Dirección *</label>
                    <input className={styles.input} placeholder="Av. Corrientes 1234"
                      value={editing.direccion ?? ''} onChange={e => setEditing({ ...editing, direccion: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Barrio</label>
                    <input className={styles.input} placeholder="Centro"
                      value={editing.barrio ?? ''} onChange={e => setEditing({ ...editing, barrio: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>URL Foto portada</label>
                    <input className={styles.input} placeholder="https://..."
                      value={editing.foto_portada ?? ''} onChange={e => setEditing({ ...editing, foto_portada: e.target.value || null })} />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>🗺️ Ubicación en el mapa</h3>
                <p className={styles.formSectionHint}>
                  Buscá el lugar en <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>, hacé click derecho y copiá las coordenadas
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Latitud *</label>
                    <input className={styles.input} type="number" step="0.000001"
                      placeholder="-26.8241"
                      value={editing.lat ?? ''} onChange={e => setEditing({ ...editing, lat: parseFloat(e.target.value) || -26.8241 })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Longitud *</label>
                    <input className={styles.input} type="number" step="0.000001"
                      placeholder="-65.2226"
                      value={editing.lng ?? ''} onChange={e => setEditing({ ...editing, lng: parseFloat(e.target.value) || -65.2226 })} />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>📞 Contacto</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Teléfono</label>
                    <input className={styles.input} placeholder="381-4001234"
                      value={editing.telefono ?? ''} onChange={e => setEditing({ ...editing, telefono: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>WhatsApp</label>
                    <input className={styles.input} placeholder="5493814001234"
                      value={editing.whatsapp ?? ''} onChange={e => setEditing({ ...editing, whatsapp: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Instagram</label>
                    <input className={styles.input} placeholder="@sangucheria"
                      value={editing.instagram ?? ''} onChange={e => setEditing({ ...editing, instagram: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Sitio web</label>
                    <input className={styles.input} placeholder="https://..."
                      value={(editing as any).sitio_web ?? ''} onChange={e => setEditing({ ...editing, sitio_web: e.target.value } as any)} />
                  </div>
                </div>
              </div>

              {/* Horarios y precio */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>🕐 Horarios y precio</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Abre (HH:MM)</label>
                    <input className={styles.input} type="time"
                      value={editing.horario_apertura ?? ''} onChange={e => setEditing({ ...editing, horario_apertura: e.target.value || null })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Cierra (HH:MM)</label>
                    <input className={styles.input} type="time"
                      value={editing.horario_cierre ?? ''} onChange={e => setEditing({ ...editing, horario_cierre: e.target.value || null })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Precio promedio ($)</label>
                    <input className={styles.input} type="number"
                      placeholder="3500"
                      value={editing.precio_promedio ?? ''} onChange={e => setEditing({ ...editing, precio_promedio: parseFloat(e.target.value) || null })} />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Tags (separados por coma)</label>
                    <input className={styles.input}
                      placeholder="crujiente, casera, grande, económica"
                      value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>⚙️ Opciones</h3>
                <div className={styles.checkGrid}>
                  {[
                    { key: 'tiene_delivery', label: '🛵 Tiene delivery' },
                    { key: 'tiene_local_fisico', label: '🏠 Tiene local físico' },
                    { key: 'activo', label: '✅ Activo (visible en el mapa)' },
                    { key: 'verificado', label: '✓ Verificado por MILAPP' },
                  ].map(({ key, label }) => (
                    <label key={key} className={styles.checkLabel}>
                      <input type="checkbox"
                        checked={(editing as any)[key] ?? false}
                        onChange={e => setEditing({ ...editing, [key]: e.target.checked })}
                        className={styles.checkInput}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !editing.nombre || !editing.direccion}>
                <Save size={15} />
                {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
