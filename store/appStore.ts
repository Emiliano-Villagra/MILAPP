// milapp/src/store/appStore.ts
import create from 'zustand';
import { supabase } from '../lib/supabase';

interface AppState {
  user: any;
  location: { lat: number; lng: number } | null;
  keepAlive: () => void;
  setUser: (user: any) => void;
  setLocation: (location: { lat: number; lng: number }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  location: null,
  keepAlive: () => {
    // KeepAlive ping cada 4 minutos
    setInterval(() => {
      supabase.from('config_app').select('key').eq('key', 'keepalive').single();
    }, 4 * 60 * 1000);
  },
  setUser: (user) => set({ user }),
  setLocation: (location) => set({ location }),
}));