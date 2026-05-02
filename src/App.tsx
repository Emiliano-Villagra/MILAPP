import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'

import Layout from '@/components/ui/Layout'
import AdminLayout from '@/components/admin/AdminLayout'

import MapaPage      from '@/pages/MapaPage'
import AuthPage      from '@/pages/AuthPage'
import PromosPage    from '@/pages/PromosPage'
import ComunidadPage from '@/pages/ComunidadPage'
import PerfilPage    from '@/pages/PerfilPage'
import LocalPage     from '@/pages/LocalPage'

import AdminLocales   from '@/pages/admin/AdminLocales'
import AdminPromos    from '@/pages/admin/AdminPromos'
import AdminUsuarios  from '@/pages/admin/AdminUsuarios'
import AdminResenas   from '@/pages/admin/AdminResenas'
import AdminConfig    from '@/pages/admin/AdminConfig'

function ProtectedAdmin({ children }: { children: JSX.Element }) {
  const profile = useAppStore(s => s.profile)
  if (profile === null) return null // loading
  if (profile?.role !== 'superadmin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { setUser, setProfile, signOut, refreshProfile } = useAppStore()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        refreshProfile()
      }
    })

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          // Wait a tick for trigger to create profile
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles').select('*')
              .eq('id', session.user.id).single()
            if (data) setProfile(data)
          }, 500)
        } else if (event === 'SIGNED_OUT') {
          signOut()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public app */}
        <Route element={<Layout />}>
          <Route path="/"           element={<MapaPage />} />
          <Route path="/auth"       element={<AuthPage />} />
          <Route path="/promos"     element={<PromosPage />} />
          <Route path="/comunidad"  element={<ComunidadPage />} />
          <Route path="/perfil"     element={<PerfilPage />} />
          <Route path="/local/:id"  element={<LocalPage />} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
          <Route index        element={<Navigate to="locales" replace />} />
          <Route path="locales"    element={<AdminLocales />} />
          <Route path="promos"     element={<AdminPromos />} />
          <Route path="usuarios"   element={<AdminUsuarios />} />
          <Route path="resenas"    element={<AdminResenas />} />
          <Route path="config"     element={<AdminConfig />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
