// PerfilPage.tsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { LogOut, Heart, Star, User, Crown } from 'lucide-react'
import styles from './PerfilPage.module.css'

export default function PerfilPage() {
  const { profile, signOut } = useAppStore()
  const navigate = useNavigate()

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.noAuth}>
          <User size={40} className={styles.noAuthIcon} />
          <h2>Ingresá para ver tu perfil</h2>
          <p>Guardá tus sangucherías favoritas, dejá reseñas y accedé a promos exclusivas.</p>
          <button className={styles.loginBtn} onClick={() => navigate('/auth')}>
            Iniciar sesión / Registrarse
          </button>
        </div>
      </div>
    )
  }

  const roleLabel = { superadmin: 'Super Admin', pro: 'Usuario PRO', basico: 'Usuario Básico' }
  const roleColor = { superadmin: 'var(--c-red)', pro: 'var(--c-gold)', basico: 'var(--c-text3)' }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          {profile.nombre?.[0]?.toUpperCase() ?? profile.email[0].toUpperCase()}
        </div>
        <h2 className={styles.nombre}>{profile.nombre ?? 'Usuario'}</h2>
        <p className={styles.email}>{profile.email}</p>
        <span className={styles.roleBadge} style={{ color: roleColor[profile.role], borderColor: roleColor[profile.role] }}>
          {profile.role === 'pro' && <Crown size={12} />}
          {roleLabel[profile.role]}
        </span>
      </div>

      {profile.role === 'basico' && (
        <div className={styles.upgradeCard}>
          <Crown size={20} className={styles.upgradeIcon} />
          <div>
            <strong>Actualizá a PRO</strong>
            <p>Accedé a descuentos exclusivos, promos especiales y más.</p>
          </div>
        </div>
      )}

      <div className={styles.menu}>
        <button className={styles.menuItem} onClick={() => {}}>
          <Heart size={18} /> Mis favoritos
        </button>
        <button className={styles.menuItem} onClick={() => {}}>
          <Star size={18} /> Mis reseñas
        </button>
        <button className={`${styles.menuItem} ${styles.danger}`} onClick={signOut}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
