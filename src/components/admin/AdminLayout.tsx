import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Store, Tag, Users, Settings, Star, ArrowLeft, Megaphone } from 'lucide-react'
import styles from './AdminLayout.module.css'

const adminNav = [
  { to: '/admin/locales',   icon: Store,     label: '🥪 Sangucherías' },
  { to: '/admin/promos',    icon: Tag,       label: '🔥 Promos' },
  { to: '/admin/publicidad',icon: Megaphone, label: '📢 Publicidad' },
  { to: '/admin/usuarios',  icon: Users,     label: '👥 Usuarios' },
  { to: '/admin/resenas',   icon: Star,      label: '⭐ Reseñas' },
  { to: '/admin/config',    icon: Settings,  label: '⚙️ Config' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Volver a la app
          </button>
          <div className={styles.titleWrap}>
            <span className={styles.titleEmoji}>🥪</span>
            <div>
              <div className={styles.titleText}>MILAPP</div>
              <div className={styles.titleSub}>Panel Admin</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {adminNav.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className={styles.bottomNav}>
        {adminNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
            <Icon size={18} />
            <span>{label.split(' ')[1]?.split(' ')[0] ?? label.slice(0,6)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
