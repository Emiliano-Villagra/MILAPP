import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setUsuarios(data);
    }
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'var(--dark)' }}>
      <h2 style={{ fontFamily: 'Syne', marginBottom: '20px' }}>Gestión de Usuarios</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {usuarios.map(u => (
          <div key={u.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
            <p><strong>{u.nombre || 'Sin nombre'}</strong></p>
            <p style={{ fontSize: '14px' }}>{u.email} - <span style={{ color: 'var(--teal)' }}>{u.role}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
