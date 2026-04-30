import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLocales() {
  const [locales, setLocales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocales();
  }, []);

  async function fetchLocales() {
    const { data } = await supabase.from('locales').select('*').order('nombre');
    if (data) setLocales(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: '20px', color: 'var(--dark)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Syne' }}>Sangucherías</h2>
        <button style={{ backgroundColor: 'var(--green)', color: 'white', border: 'none', padding: '10px', borderRadius: '5px' }}>+ Nuevo</button>
      </div>

      {loading ? <p>Cargando locales...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {locales.map(local => (
            <div key={local.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid var(--blue)' }}>
              <h3 style={{ fontSize: '16px' }}>{local.nombre}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>{local.direccion} - {local.barrio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
