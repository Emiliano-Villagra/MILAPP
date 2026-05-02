import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Store, Tag, Users, Settings, Star, ArrowLeft } from 'lucide-react'
import styles from './AdminLayout.module.css'

const adminNav = [
  { to: '/admin/locales',  icon: Store,    label: 'Sangucherías' },
  { to: '/admin/promos',   icon: Tag,      label: 'Promos' },
  { to: '/admin/usuarios', icon: Users,    label: 'Usuarios' },
  { to: '/admin/resenas',  icon: Star,     label: 'Reseñas' },
  { to: '/admin/config',   icon: Settings, label: 'Config' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className={styles.shell}>
      {/* Sidebar desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> App
          </button>
          <div className={styles.brand}>
            <span className={styles.brandEmoji}>🥩</span>
            <div>
              <div className={styles.brandName}>MILAPP</div>
              <div className={styles.brandSub}>Panel Admin</div>
            </div>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `${styles.sideItem} ${isActive ? styles.active : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className={styles.bottomNav}>
        {adminNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomActive : ''}`}>
            <Icon size={20} />
            <span>{label.slice(0, 6)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
