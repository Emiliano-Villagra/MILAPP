import { create } from 'zustand'
import { supabase, type Profile, type Local } from '@/lib/supabase'

interface UserLocation {
  lat: number
  lng: number
  accuracy?: number
}

interface AppStore {
  // Auth
  profile: Profile | null
  loading: boolean
  setProfile: (p: Profile | null) => void
  setLoading: (v: boolean) => void
  signOut: () => Promise<void>

  // Location
  userLocation: UserLocation | null
  locationError: string | null
  setUserLocation: (loc: UserLocation | null) => void
  setLocationError: (e: string | null) => void
  requestLocation: () => void

  // Map
  selectedLocal: Local | null
  setSelectedLocal: (l: Local | null) => void
  mapCenter: [number, number]
  mapZoom: number
  setMapView: (center: [number, number], zoom: number) => void

  // Filters
  soloDelivery: boolean
  soloVerificados: boolean
  searchQuery: string
  radioKm: number
  setSoloDelivery: (v: boolean) => void
  setSoloVerificados: (v: boolean) => void
  setSearchQuery: (q: string) => void
  setRadioKm: (r: number) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null })
  },

  // Location
  userLocation: null,
  locationError: null,
  setUserLocation: (userLocation) => set({ userLocation, locationError: null }),
  setLocationError: (locationError) => set({ locationError }),
  requestLocation: () => {
    if (!navigator.geolocation) {
      set({ locationError: 'Tu navegador no soporta geolocalización' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          userLocation: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          locationError: null,
        })
      },
      (err) => {
        set({ locationError: `No se pudo obtener tu ubicación: ${err.message}` })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  },

  // Map
  selectedLocal: null,
  setSelectedLocal: (selectedLocal) => set({ selectedLocal }),
  mapCenter: [-26.8241, -65.2226], // Tucumán
  mapZoom: 13,
  setMapView: (mapCenter, mapZoom) => set({ mapCenter, mapZoom }),

  // Filters
  soloDelivery: false,
  soloVerificados: false,
  searchQuery: '',
  radioKm: 3,
  setSoloDelivery: (soloDelivery) => set({ soloDelivery }),
  setSoloVerificados: (soloVerificados) => set({ soloVerificados }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRadioKm: (radioKm) => set({ radioKm }),
}))
