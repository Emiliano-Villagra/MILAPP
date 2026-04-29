import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Local = {
  id: string;
  nombre: string;
  direccion?: string;
  lat: number;
  lng: number;
  calificacion_promedio?: number;
  total_resenas?: number;
};
