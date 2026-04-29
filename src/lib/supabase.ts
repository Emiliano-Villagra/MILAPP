// milapp/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL o ANON KEY no encontradas en .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definición de tipos
export type Profile = {
  id: string;
  email: string;
  nombre: string;
  role: 'basico' | 'pro' | 'superadmin';
  avatar_url?: string;
};

export type Local = {
  id: string;
  nombre: string;
  direccion?: string;
  lat: number;
  lng: number;
  barrio?: string;
  tags?: string[];
  tiene_delivery: boolean;
  verificado: boolean;
  activo: boolean;
};

export type Producto = {
  id: string;
  local_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
};

export type Promocion = {
  id: string;
  local_id: string;
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  tipo: 'descuento' | 'combo' | '2x1' | 'envio_gratis' | 'publicidad' | 'destacado';
  visibilidad: 'todos' | 'pro';
  activo: boolean;
};

export type Resena = {
  id: string;
  user_id: string;
  local_id: string;
  calificacion: number;
  comentario?: text;
  aprobada: boolean;
};