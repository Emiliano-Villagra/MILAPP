import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface UserLocation { lat: number; lng: number }

interface AppState {
  user: any
  profile: any
  userLocation: UserLocation | null
  locationLoading: boolean
  searchQuery: string
  soloDelivery: boolean
  soloVerificados: boolean
  radioKm: number

  setUser: (user: any) => void
  setProfile: (profile: any) => void
  setUserLocation: (loc: UserLocation | null) => void
  setSearchQuery: (q: string) => void
  setSoloDelivery: (v: boolean) => void
  setSoloVerificados: (v: boolean) => void
  setRadioKm: (v: number) => void
  requestLocation: () => void
  signOut: () => void
  refreshProfile: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      userLocation: null,
      locationLoading: false,
      searchQuery: '',
      soloDelivery: false,
      soloVerificados: false,
      radioKm: 5,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setUserLocation: (loc) => set({ userLocation: loc }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSoloDelivery: (soloDelivery) => set({ soloDelivery }),
      setSoloVerificados: (soloVerificados) => set({ soloVerificados }),
      setRadioKm: (radioKm) => set({ radioKm }),

      requestLocation: () => {
        set({ locationLoading: true })
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            set({
              userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              locationLoading: false,
            })
          },
          () => set({ locationLoading: false }),
          { enableHighAccuracy: true, timeout: 8000 }
        )
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) set({ profile: data })
      },

      signOut: () => set({ user: null, profile: null }),
    }),
    {
      name: 'milapp-store',
      partialize: (s) => ({
        soloDelivery: s.soloDelivery,
        soloVerificados: s.soloVerificados,
        radioKm: s.radioKm,
      }),
    }
  )
)
