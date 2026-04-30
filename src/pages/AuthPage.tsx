import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setUser, setProfile } = useAppStore();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let authResponse;
      
      // 1. Loguear o Registrar en Supabase Auth
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      } else {
        authResponse = await supabase.auth.signUp({ email, password });
      }

      if (authResponse.error) throw authResponse.error;

      if (authResponse.data.user) {
        // 2. Guardar el usuario básico en la memoria de la app
        setUser(authResponse.data.user);

        // 3. Buscar el Perfil completo (con el rol) en la tabla profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authResponse.data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error buscando perfil:', profileError);
        }

        // 4. Guardar el perfil en la memoria y mandar al inicio
        if (profileData) {
          setProfile(profileData);
        }
        
        navigate('/'); // Redirigir al mapa/inicio después de loguearse
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--blue)' }}>
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h2>
      
      {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: 'var(--orange)', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        style={{ background: 'none', border: 'none', color: 'var(--blue)', textDecoration: 'underline', marginTop: '20px', cursor: 'pointer', width: '100%' }}
      >
        {isLogin ? '¿No tenés cuenta? Registrate acá' : '¿Ya tenés cuenta? Iniciá sesión'}
      </button>
    </div>
  );
}
