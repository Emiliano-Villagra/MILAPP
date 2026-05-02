import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { User, LogIn } from 'lucide-react'
import styles from './TopBar.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/': 'MILAPP',
  '/promos': 'Promos',
  '/comunidad': 'Comunidad',
  '/perfil': 'Mi Perfil',
  '/auth': 'Ingresar',
}

export default function TopBar() {
  const { user } = useAppStore()
  const { pathname } = useLocation()

  const isMap = pathname === '/'
  const title = PAGE_TITLES[pathname] ?? 'MILAPP'

  return (
    <header className={`${styles.bar} ${isMap ? styles.transparent : styles.solid}`}>
      <NavLink to="/" className={styles.logo}>
        <span className={styles.logoIcon}>🥩</span>
        <span className={styles.logoText}>MILAPP</span>
      </NavLink>

      {!isMap && (
        <h1 className={styles.title}>{title}</h1>
      )}

      <div className={styles.right}>
        {user ? (
          <NavLink to="/perfil" className={styles.avatarBtn}>
            <User size={18} />
          </NavLink>
        ) : (
          <NavLink to="/auth" className={styles.loginBtn}>
            <LogIn size={16} />
            <span>Entrar</span>
          </NavLink>
        )}
      </div>
    </header>
  )
}
