import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'superadmin' | 'pro' | 'basico';

export type Profile = {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  avatar_url?: string;
  activo?: boolean;
};

export type Local = {
  id: string;
  nombre: string;
  direccion?: string;
  descripcion?: string;
  lat: number;
  lng: number;
  barrio?: string;
  ciudad?: string;
  provincia?: string;
  tags?: string[];
  tiene_delivery?: boolean;
  verificado?: boolean;
  activo?: boolean;
  foto_portada?: string;
  calificacion_promedio?: number;
  total_resenas?: number;
  precio_promedio?: number;
  distancia?: number; 
  horario_apertura?: string;
  horario_cierre?: string;
  dias_abierto?: string;
  telefono?: string;
  whatsapp?: string;
  instagram?: string;
  sitio_web?: string;
};

export type Producto = {
  id: string;
  local_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  es_destacado?: boolean;
  foto?: string;
};

export type Promocion = {
  id: string;
  local_id: string;
  titulo?: string;
  descripcion?: string;
  imagen?: string;
  tipo: 'descuento' | 'combo' | '2x1' | 'envio_gratis' | 'publicidad' | 'destacado';
  visibilidad: 'todos' | 'pro';
  activo?: boolean;
  activa?: boolean; 
  codigo_descuento?: string;
  descuento_porcentaje?: number;
  fecha_fin?: string;
  orden?: number;
  local?: Partial<Local>;
};

export type Resena = {
  id: string;
  user_id: string;
  local_id: string;
  calificacion: number;
  comentario?: string;
  aprobada: boolean;
  profiles?: Partial<Profile>;
};
