import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import './Layout.css';

export default function Layout({ children }: { children: ReactNode }) {
  // Traemos el usuario y el perfil de la memoria global
  const { user, profile } = useAppStore();

  return (
    <div className="layout-wrapper">
      <header className="header bg-blue text-cream">
        <div className="logo">MILAPP</div>
        
        {/* Lógica del encabezado: Si no hay usuario, va a Login. Si hay, va a su Perfil */}
        {!user ? (
          <NavLink to="/auth" className="btn btn-primary" style={{padding: '5px 10px', fontSize: '14px', textDecoration: 'none'}}>Login</NavLink>
        ) : (
          <NavLink to="/perfil" className="btn btn-primary" style={{padding: '5px 10px', fontSize: '14px', textDecoration: 'none', backgroundColor: 'var(--green)'}}>Mi Perfil</NavLink>
        )}
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav bg-blue">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🗺️ Mapa</NavLink>
        <NavLink to="/promos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🔥 Promos</NavLink>
        <NavLink to="/comunidad" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>👥 Red</NavLink>
        
        {/* LA CERRADURA: Este botón solo se inyecta en el diseño si sos superadmin */}
        {profile?.role === 'superadmin' && (
          <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>⚙️ Admin</NavLink>
        )}
      </nav>
    </div>
  );
}
