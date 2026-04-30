import { create } from 'zustand';

interface AppState {
  user: any;
  profile: any;
  userLocation: any;
  searchQuery: string;
  soloDelivery: boolean;
  soloVerificados: boolean;
  radioKm: number;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setSearchQuery: (query: string) => void;
  setSoloDelivery: (val: boolean) => void;
  setSoloVerificados: (val: boolean) => void;
  setRadioKm: (val: number) => void;
  requestLocation: () => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  userLocation: null,
  searchQuery: '',
  soloDelivery: false,
  soloVerificados: false,
  radioKm: 5,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSoloDelivery: (val) => set({ soloDelivery: val }),
  setSoloVerificados: (val) => set({ soloVerificados: val }),
  setRadioKm: (val) => set({ radioKm: val }),
  requestLocation: () => {},
  signOut: () => set({ user: null, profile: null })
}));
