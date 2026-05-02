import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Shield, Star, User, Ban, CheckCircle } from 'lucide-react'
import styles from './AdminPage.module.css'

const ROLES = ['basico', 'pro', 'superadmin'] as const

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = () => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsuarios(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const changeRole = async (id: string, role: string) => {
    setUpdatingId(id)
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsuarios(us => us.map(u => u.id === id ? { ...u, role } : u))
    setUpdatingId(null)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    setUpdatingId(id)
    await supabase.from('profiles').update({ activo: !activo }).eq('id', id)
    setUsuarios(us => us.map(u => u.id === id ? { ...u, activo: !activo } : u))
    setUpdatingId(null)
  }

  const filtered = usuarios.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.email ?? '').toLowerCase().includes(q) ||
           (u.nombre ?? '').toLowerCase().includes(q)
  })

  const ROLE_ICONS: Record<string, any> = {
    superadmin: Shield, pro: Star, basico: User,
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Usuarios</h1>
          <p className={styles.pageSub}>{usuarios.length} registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No se encontraron usuarios</p>
      ) : (
        <div className={styles.table}>
          {filtered.map(u => {
            const RoleIcon = ROLE_ICONS[u.role] ?? User
            return (
              <div key={u.id} className={`${styles.row} ${!u.activo ? styles.inactive : ''}`}>
                <div className={styles.rowMain}>
                  <div className={styles.avatar}>{(u.nombre ?? u.email ?? '?')[0].toUpperCase()}</div>

                  <div className={styles.rowInfo}>
                    <div className={styles.rowNameRow}>
                      <span className={styles.rowName}>{u.nombre || 'Sin nombre'}</span>
                      <div className={`${styles.roleBadge} ${styles['role_' + u.role]}`}>
                        <RoleIcon size={11} /> {u.role}
                      </div>
                    </div>
                    <span className={styles.rowSub}>{u.email}</span>
                    {!u.activo && (
                      <span className={styles.bannedBadge}>Suspendido</span>
                    )}
                  </div>

                  <div className={styles.rowActions}>
                    {/* Role selector */}
                    <select
                      className={styles.roleSelect}
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={e => changeRole(u.id, e.target.value)}
                      title="Cambiar rol"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    {/* Toggle active */}
                    <button
                      className={`${styles.iconBtn} ${!u.activo ? styles.activateBtn : styles.banBtn}`}
                      disabled={updatingId === u.id}
                      onClick={() => toggleActivo(u.id, u.activo)}
                      title={u.activo ? 'Suspender' : 'Activar'}
                    >
                      {u.activo ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
