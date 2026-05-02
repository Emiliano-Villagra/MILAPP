import { NavLink } from 'react-router-dom'
import { Map, Zap, Users, User, Settings } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const profile = useAppStore(s => s.profile)

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <Map size={22} />
        <span>Mapa</span>
      </NavLink>
      <NavLink to="/promos" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <Zap size={22} />
        <span>Promos</span>
      </NavLink>
      <NavLink to="/comunidad" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <Users size={22} />
        <span>Comunidad</span>
      </NavLink>
      <NavLink to="/perfil" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <User size={22} />
        <span>Perfil</span>
      </NavLink>
      {profile?.role === 'superadmin' && (
        <NavLink to="/admin" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <Settings size={22} />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  )
}
