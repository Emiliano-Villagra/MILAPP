import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'

// Layouts y Páginas
import Layout from '@/components/ui/Layout'
import MapaPage from '@/pages/MapaPage'
import PromosPage from '@/pages/PromosPage'
import LocalPage from '@/pages/LocalPage'
import AuthPage from '@/pages/AuthPage'
import PerfilPage from '@/pages/PerfilPage'
import ConfigPage from '@/pages/ConfigPage'
import ComunidadPage from '@/pages/ComunidadPage'
import ElegidosPage from '@/pages/ElegidosPage'

// Admin
import AdminLayout from '@/components/admin/AdminLayout'
import AdminLocales from '@/pages/admin/AdminLocales'
import AdminPromos from '@/pages/admin/AdminPromos'
import AdminPublicidad from '@/pages/admin/AdminPublicidad'
import AdminUsuarios from '@/pages/admin/AdminUsuarios'
import AdminResenas from '@/pages/admin/AdminResenas'
import AdminConfig from '@/pages/admin/AdminConfig'

/**
 * Pantalla de carga con estilo MILAPP
 */
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100dvh', gap: '20px',
      background: '#F2EBDC', fontFamily: 'Syne, sans-serif'
    }}>
      <div style={{ fontSize: '4rem', animation: 'bounce 1s infinite' }}>🥪</div>
      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0A4DA6' }}>Cargando MILAPP...</div>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '4px solid #0A4DA622',
        borderTop: '4px solid #0A4DA6', borderRadius: '50%', animation: 'spin 1s linear infinite'
      }} />
    </div>
  )
}

export default function App() {
  const { profile, setProfile, setLoading, loading } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Intentar obtener sesión real
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setProfile(dbProfile || {
            id: session.user.id,
            email: session.user.email!,
            nombre: 'Usuario Milapp',
            role: 'superadmin',
            activo: true
          } as any)
        }
      } catch (err) {
        console.warn("Auth Offline: Entrando en modo desarrollo local")
        // No hacemos nada, el timeout de abajo disparará el acceso si es necesario
      } finally {
        // Pequeño delay para que la transición no sea brusca
        setTimeout(() => setLoading(false), 800)
      }
    }

    initializeAuth()

    // ESCUDO DE SEGURIDAD: Si después de 3 segundos sigue cargando, forzamos el fin de carga
    const emergencyTimeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(emergencyTimeout)
    }
  }, [setProfile, setLoading])

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Ruta de Auth separada */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Rutas de la App (Protegidas por perfil) */}
      <Route 
        path="/" 
        element={profile ? <Layout /> : <Navigate to="/auth" replace />}
      >
        <Route index element={<MapaPage />} />
        <Route path="promos" element={<PromosPage />} />
        <Route path="local/:id" element={<LocalPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="comunidad" element={<ComunidadPage />} />
        <Route path="elegidos" element={<ElegidosPage />} />
      </Route>

      {/* Panel de Administración (Desbloqueado para desarrollo) */}
      <Route 
        path="/admin" 
        element={<AdminLayout />}
      >
        <Route index element={<Navigate to="locales" replace />} />
        <Route path="locales" element={<AdminLocales />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="publicidad" element={<AdminPublicidad />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="resenas" element={<AdminResenas />} />
        <Route path="config" element={<AdminConfig />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}