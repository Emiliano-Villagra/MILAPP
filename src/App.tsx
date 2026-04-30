import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

// Importación de Capas de Diseño
import Layout from '@/components/ui/Layout';

// Importación de Páginas (Asegurate de que los nombres coincidan con tus archivos)
import MapaPage from '@/pages/MapaPage';
import AuthPage from '@/pages/AuthPage';
import PromosPage from '@/pages/PromosPage';
import ComunidadPage from '@/pages/ComunidadPage';
import PerfilPage from '@/pages/PerfilPage';
import LocalPage from '@/pages/LocalPage';

// Importación de Páginas de Administración
import AdminLocales from '@/pages/admin/AdminLocales';
import AdminPromos from '@/pages/admin/AdminPromos';
import AdminUsuarios from '@/pages/admin/AdminUsuarios';

export default function App() {
  const { profile } = useAppStore();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<MapaPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          
          {/* Detalle de un Local (con ID variable) */}
          <Route path="/local/:id" element={<LocalPage />} />

          {/* Ruta de Perfil (Solo accesible si hay usuario, sino podrías redirigir) */}
          <Route path="/perfil" element={<PerfilPage />} />

          {/* Rutas de Administración (Protegidas visualmente por el rol) */}
          {profile?.role === 'superadmin' ? (
            <>
              <Route path="/admin" element={<AdminLocales />} />
              <Route path="/admin/locales" element={<AdminLocales />} />
              <Route path="/admin/promos" element={<AdminPromos />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            </>
          ) : (
            // Si alguien intenta entrar a /admin y no es superadmin, lo manda al mapa
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          )}

          {/* Ruta por defecto: si escriben cualquier cosa, al mapa */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
