import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import './Layout.css';

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAppStore();

  return (
    <div className="layout-wrapper">
      <header className="header bg-blue text-cream">
        <div className="logo">MILAPP</div>
        {!user && <NavLink to="/" className="btn btn-primary" style={{padding: '5px 10px', fontSize: '14px'}}>Login</NavLink>}
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav bg-blue">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🗺️ Mapa</NavLink>
        <NavLink to="/promos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>🔥 Promos</NavLink>
        <NavLink to="/comunidad" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>👥 Red</NavLink>
      </nav>
    </div>
  );
}
