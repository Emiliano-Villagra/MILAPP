import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save } from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminConfig() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('config_app').select('*')
      .then(({ data }) => {
        if (data) {
          const obj: Record<string, string> = {}
          data.forEach((row: any) => {
            obj[row.key] = typeof row.value === 'string'
              ? row.value.replace(/^"|"$/g, '')
              : String(row.value)
          })
          setConfig(obj)
        }
        setLoading(false)
      })
  }, [])

  const saveAll = async () => {
    setSaving(true)
    for (const [key, value] of Object.entries(config)) {
      const jsonVal = isNaN(Number(value)) && value !== 'true' && value !== 'false'
        ? JSON.stringify(value)
        : value
      await supabase.from('config_app').update({ value: jsonVal, updated_at: new Date().toISOString() }).eq('key', key)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const configLabels: Record<string, string> = {
    app_nombre: 'Nombre de la app',
    app_subtitulo: 'Subtítulo',
    mapa_centro_lat: 'Centro del mapa - Latitud',
    mapa_centro_lng: 'Centro del mapa - Longitud',
    mapa_zoom_inicial: 'Zoom inicial del mapa',
    radio_cercanos_km: 'Radio búsqueda cercanos (km)',
    mantenimiento: 'Modo mantenimiento (true/false)',
    registro_abierto: 'Registro abierto (true/false)',
  }

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Config General</h1>
          <p className={styles.pageSub}>Parámetros generales de MILAPP</p>
        </div>
        <button className={styles.btnPrimary} onClick={saveAll} disabled={saving}>
          <Save size={16} />
          {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxWidth:'500px' }}>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{configLabels[key] ?? key}</label>
            <input
              className={styles.input}
              value={value}
              onChange={e => setConfig({ ...config, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
