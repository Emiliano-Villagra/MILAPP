// milapp/src/components/ui/Layout.tsx
import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';
import { useAppStore } from '../../store/appStore';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAppStore();

  const navItems = [
    { to: '/', label: 'Mapa', icon: '🗺️' },
    { to: '/promos', label: 'Promos', icon: '🔥' },
    { to: '/comunidad', label: 'Comunidad', icon: '👥' },
    { to: '/elegidos', label: 'Elegidos', icon: '👑' },
  ];

  if (user) navItems.push({ to: '/perfil', label: 'Perfil', icon: '👤' });

  return (
    <div className={styles.wrapper}>
      {/* Header Mobile y Sidebar Desktop */}
      <header className={`${styles.header} bg-blue text-cream`}>
        <div className={styles.logo}>MILAPP</div>
        {user ? (
          <div className={styles.avatar}>👤</div>
        ) : (
          <NavLink to="/auth" className="btn btn-primary">
            Login
          </NavLink>
        )}
      </header>

      {/* Sidebar Desktop */}
      <aside className={`${styles.sidebar} bg-blue text-cream`}>
        <div className={styles.logo}>MILAPP</div>
        <nav className={styles.desktopNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              <span className={styles.icon}>{item.icon}</span> {item.label}
            </NavLink>
          ))}
          {user?.role === 'superadmin' && (
            <NavLink to="/admin/locales" className={styles.navItem}>
              ⚙️ Admin
            </NavLink>
          )}
        </nav>
      </aside>

      <main className={styles.mainContent}>{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className={`${styles.bottomNav} bg-blue text-cream`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.bottomNavItem} ${styles.bottomNavItemActive}` : styles.bottomNavItem
            }
          >
            <span className={styles.bottomNavIcon}>{item.icon}</span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;