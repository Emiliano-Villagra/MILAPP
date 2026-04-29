// AdminUsuarios.tsx
import { useEffect, useState } from 'react'
import { supabase, type Profile, type UserRole } from '@/lib/supabase'
import { Search, Shield } from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminUsuarios() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers((data as Profile[]) ?? []); setLoading(false) })
  }
  useEffect(load, [])

  const setRole = async (id: string, role: UserRole) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  const toggleActivo = async (u: Profile) => {
    await supabase.from('profiles').update({ activo: !u.activo }).eq('id', u.id)
    load()
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.nombre?.toLowerCase().includes(search.toLowerCase()))
  )

  const roleColor: Record<UserRole, string> = {
    superadmin: 'var(--c-red)',
    pro: 'var(--c-gold)',
    basico: 'var(--c-text3)',
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Usuarios</h1>
          <p className={styles.pageSub}>{users.length} registrados</p>
        </div>
      </div>
      <div className={styles.searchBar}>
        <Search size={15} className={styles.searchIcon} />
        <input className={styles.search} placeholder="Buscar por email o nombre..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading ? <div className={styles.loading}><div className={styles.spinner} /></div> : (
        <div className={styles.table}>
          {filtered.map(u => (
            <div key={u.id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowInfo}>
                  <span className={styles.rowName}>{u.nombre ?? 'Sin nombre'}</span>
                  <span className={styles.rowSub}>{u.email}</span>
                  <div className={styles.rowBadges}>
                    <span style={{ color: roleColor[u.role], borderColor: roleColor[u.role] }}
                      className={styles.badgeStatus}>{u.role}</span>
                    {!u.activo && <span className={styles.badgeInactive}>Bloqueado</span>}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <select
                    className={styles.input}
                    style={{ width: 'auto', padding: '5px 8px', fontSize: '0.75rem' }}
                    value={u.role}
                    onChange={e => setRole(u.id, e.target.value as UserRole)}
                  >
                    <option value="basico">Básico</option>
                    <option value="pro">PRO</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                  <button
                    className={styles.iconBtn}
                    onClick={() => toggleActivo(u)}
                    title={u.activo ? 'Bloquear' : 'Activar'}
                  >
                    <Shield size={15} className={u.activo ? styles.verified : ''} />
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
