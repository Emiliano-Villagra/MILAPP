import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import './Layout.css';

export default function Layout() {
  const { user, profile } = useAppStore();

  return (
    <div className="layout-wrapper">
      <header className="header bg-blue text-cream">
        <div className="logo">MILAPP</div>
        
        {!user ? (
          <NavLink to="/auth" className="btn btn-primary" style={{padding: '5px 10px', fontSize: '14px', textDecoration: 'none'}}>Login</NavLink>
        ) : (
          <NavLink to="/perfil" className="btn btn-primary" style={{padding: '5px 10px', fontSize: '14px', textDecoration: 'none', backgroundColor: 'var(--green)'}}>Mi Perfil</NavLink>
        )}
      </header>

      <main className="main-content">
        {/* LA VENTANA: Outlet es el proyector que muestra la página que corresponda */}
        <Outlet />
      </main>

      <nav className="bottom-nav bg-blue">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🗺️ Mapa</NavLink>
        <NavLink to="/promos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🔥 Promos</NavLink>
        <NavLink to="/comunidad" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>👥 Red</NavLink>
        
        {/* LA CERRADURA: Botón de Admin solo para vos */}
        {profile?.role === 'superadmin' && (
          <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>⚙️ Admin</NavLink>
        )}
      </nav>
    </div>
  );
}
