import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { User, LogOut, Settings, Edit2, Check, X, Star, Heart, Crown } from 'lucide-react'
import styles from './PerfilPage.module.css'

const ROLE_LABELS: Record<string, string> = {
  superadmin: '⚙️ Superadmin',
  pro: '⭐ Pro',
  basico: '🥩 Básico',
}

export default function PerfilPage() {
  const { profile, user, signOut, setProfile } = useAppStore()
  const navigate = useNavigate()

  const [editingNombre, setEditingNombre] = useState(false)
  const [nombre, setNombre] = useState(profile?.nombre ?? '')
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    signOut()
    navigate('/')
  }

  const saveNombre = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ nombre }).eq('id', profile.id)
    setProfile({ ...profile, nombre })
    setSaving(false)
    setEditingNombre(false)
  }

  if (!user) {
    return (
      <div className={styles.noAuth}>
        <span className={styles.noAuthEmoji}>🥩</span>
        <h2>Todavía no ingresaste</h2>
        <p>Iniciá sesión para ver tu perfil</p>
        <button className={styles.loginBtn} onClick={() => navigate('/auth')}>
          Ingresar
        </button>
      </div>
    )
  }

  const avatarLetter = profile?.nombre?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={styles.page}>
      {/* Avatar + info */}
      <div className={styles.hero}>
        <div className={styles.avatar}>{avatarLetter}</div>

        <div className={styles.nameWrap}>
          {editingNombre ? (
            <div className={styles.nameEdit}>
              <input
                className={styles.nameInput}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveNombre(); if (e.key === 'Escape') setEditingNombre(false) }}
              />
              <button className={styles.editActionBtn} onClick={saveNombre} disabled={saving}>
                <Check size={16} />
              </button>
              <button className={styles.editActionBtn} onClick={() => setEditingNombre(false)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.nameDisplay}>
              <h2 className={styles.name}>{profile?.nombre || 'Sin nombre'}</h2>
              <button className={styles.editBtn} onClick={() => setEditingNombre(true)}>
                <Edit2 size={14} />
              </button>
            </div>
          )}
          <span className={styles.email}>{user.email}</span>
        </div>

        <div className={styles.roleBadge} data-role={profile?.role}>
          {ROLE_LABELS[profile?.role ?? 'basico'] ?? profile?.role}
        </div>
      </div>

      {/* Stats (placeholders) */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Heart size={20} className={styles.statIcon} />
          <span className={styles.statLabel}>Favoritos</span>
        </div>
        <div className={styles.statCard}>
          <Star size={20} className={styles.statIcon} />
          <span className={styles.statLabel}>Reseñas</span>
        </div>
        {profile?.role !== 'pro' && profile?.role !== 'superadmin' && (
          <div className={`${styles.statCard} ${styles.proCard}`}>
            <Crown size={20} className={styles.statIconGold} />
            <span className={styles.statLabel}>Ir PRO</span>
          </div>
        )}
      </div>

      {/* Admin shortcut */}
      {profile?.role === 'superadmin' && (
        <button className={styles.adminBtn} onClick={() => navigate('/admin')}>
          <Settings size={16} />
          Panel de administración
        </button>
      )}

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  )
}
