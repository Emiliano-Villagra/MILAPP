import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import MapaPage from './pages/MapaPage';

// Componentes falsos para que no rompa la compilación
const PromosPage = () => <div style={{padding: 20}}><h2>🔥 Promos Activas</h2></div>;
const ComunidadPage = () => <div style={{padding: 20}}><h2>👥 La Comunidad</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MapaPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
