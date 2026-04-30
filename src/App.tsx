import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

// Caparazón de la App
import Layout from '@/components/ui/Layout';

// Páginas de Usuario (Públicas y Perfil)
import MapaPage from '@/pages/MapaPage';
import AuthPage from '@/pages/AuthPage';
import PromosPage from '@/pages/PromosPage';
import ComunidadPage from '@/pages/ComunidadPage';
import PerfilPage from '@/pages/PerfilPage';
import LocalPage from '@/pages/LocalPage';

// Páginas de Administración (Gestión)
import AdminLocales from '@/pages/admin/AdminLocales';
import AdminPromos from '@/pages/admin/AdminPromos';
import AdminUsuarios from '@/pages/admin/AdminUsuarios';

export default function App() {
  const { profile } = useAppStore();

  // Función para proteger rutas de administrador
  const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
    if (profile?.role !== 'superadmin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* 1. MÓDULOS DE USUARIO */}
          <Route path="/" element={<MapaPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/local/:id" element={<LocalPage />} />

          {/* 2. MÓDULOS DE ADMINISTRACIÓN (Protegidos) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminLocales />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/locales" 
            element={
              <ProtectedAdminRoute>
                <AdminLocales />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/promos" 
            element={
              <ProtectedAdminRoute>
                <AdminPromos />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/usuarios" 
            element={
              <ProtectedAdminRoute>
                <AdminUsuarios />
              </ProtectedAdminRoute>
            } 
          />

          {/* 3. GESTIÓN DE ERRORES (Cualquier ruta rara vuelve al mapa) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
