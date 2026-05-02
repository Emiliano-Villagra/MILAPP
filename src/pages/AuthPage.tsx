import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import styles from './AuthPage.module.css'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { setUser, setProfile } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        })
        if (error) throw error
        setSuccess('Te enviamos un email para recuperar tu contraseña.')
        return
      }

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          setUser(data.user)
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
          if (prof) setProfile(prof)
          navigate(from, { replace: true })
        }
      } else {
        // Register
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { nombre } }
        })
        if (error) throw error
        if (data.user) {
          // Check if email confirmation required
          if (!data.session) {
            setSuccess('¡Cuenta creada! Revisá tu email para confirmar.')
          } else {
            setUser(data.user)
            // Wait for trigger
            await new Promise(r => setTimeout(r, 600))
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
            if (prof) setProfile(prof)
            navigate(from, { replace: true })
          }
        }
      }
    } catch (err: any) {
      const msg = err.message ?? 'Error desconocido'
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos')
      else if (msg.includes('already registered')) setError('Ese email ya tiene cuenta. Iniciá sesión.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <span className={styles.logoEmoji}>🥩</span>
          <h1 className={styles.logoText}>MILAPP</h1>
        </div>

        <h2 className={styles.title}>
          {mode === 'login' && 'Bienvenido de vuelta'}
          {mode === 'register' && 'Crear cuenta'}
          {mode === 'forgot' && 'Recuperar contraseña'}
        </h2>
        <p className={styles.sub}>
          {mode === 'login' && 'La guía de milanesas de Tucumán'}
          {mode === 'register' && 'Unite a la comunidad sanguchera'}
          {mode === 'forgot' && 'Te enviamos un link por email'}
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <User size={16} className={styles.fieldIcon} />
              <input
                className={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <Mail size={16} className={styles.fieldIcon} />
            <input
              className={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode !== 'forgot' && (
            <div className={styles.field}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Contraseña'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <button type="button" className={styles.forgotLink} onClick={() => setMode('forgot')}>
              ¿Olvidaste la contraseña?
            </button>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.btnSpinner} />
            ) : (
              <>
                {mode === 'login' && 'Ingresar'}
                {mode === 'register' && 'Crear cuenta'}
                {mode === 'forgot' && 'Enviar email'}
              </>
            )}
          </button>
        </form>

        <div className={styles.switchRow}>
          {mode === 'login' ? (
            <>
              <span>¿No tenés cuenta?</span>
              <button className={styles.switchBtn} onClick={() => { setMode('register'); setError(null) }}>
                Registrate
              </button>
            </>
          ) : (
            <>
              <span>¿Ya tenés cuenta?</span>
              <button className={styles.switchBtn} onClick={() => { setMode('login'); setError(null) }}>
                Iniciá sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
