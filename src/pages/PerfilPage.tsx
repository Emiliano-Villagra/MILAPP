import { useAppStore } from '@/store/appStore';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function PerfilPage() {
  const { profile, signOut } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', color: 'var(--dark)' }}>
      <h1 style={{ marginBottom: '20px', fontFamily: 'Syne' }}>Mi Perfil</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p><strong>Nombre:</strong> {profile?.nombre || 'No asignado'}</p>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Rol:</strong> <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{profile?.role}</span></p>
      </div>

      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '30px', width: '100%', padding: '15px', 
          backgroundColor: '#e74c3c', color: 'white', border: 'none', 
          borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
