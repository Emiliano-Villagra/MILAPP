# 🥩 MILAPP
**La base de datos más grande de sangucherías de milanesa de Tucumán**

Stack: React 18 + TypeScript + Vite + Supabase + Leaflet/OpenStreetMap + Vercel

---

## 🚀 Setup en 10 pasos

### 1. Clonar / crear el repo en GitHub
```bash
git init
git add .
git commit -m "feat: MILAPP initial commit"
gh repo create milapp --public --push
# o subir manualmente desde GitHub Desktop
```

### 2. Supabase — crear proyecto
1. Entrar a https://supabase.com y crear un nuevo proyecto
2. Ir a **SQL Editor** y pegar TODO el contenido de `supabase_schema.sql`
3. Ejecutar ▶️ (puede tardar 30s)
4. Ir a **Storage** y crear 3 buckets públicos:
   - `locales-fotos`
   - `promos-imagenes`
   - `avatars`

### 3. Obtener credenciales de Supabase
Ir a **Settings → API** y copiar:
- `Project URL` → va a `VITE_SUPABASE_URL`
- `anon public key` → va a `VITE_SUPABASE_ANON_KEY`

### 4. Crear `.env.local`
```bash
cp .env.example .env.local
# Editar con tus credenciales reales
```

### 5. Instalar dependencias y correr localmente
```bash
npm install
npm run dev
```
La app corre en http://localhost:5173

### 6. Crear tu cuenta superadmin
1. Ir a http://localhost:5173/auth
2. Registrarse con tu email
3. Confirmar el email
4. En Supabase → SQL Editor, ejecutar:
```sql
UPDATE profiles SET role = 'superadmin' WHERE email = 'tu@email.com';
```

### 7. Acceder al panel admin
Ir a http://localhost:5173/admin
Verás los 5 módulos: Locales, Promos, Usuarios, Reseñas, Config

### 8. Deploy en Vercel
1. Ir a https://vercel.com/new
2. Importar tu repo de GitHub
3. En **Environment Variables** agregar:
   - `VITE_SUPABASE_URL` = tu URL
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
4. Framework preset: **Vite**
5. Click **Deploy** ✅

### 9. Configurar dominio en Supabase
Ir a **Authentication → URL Configuration** y agregar:
- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `https://tu-app.vercel.app/**`

### 10. ¡Listo! 🎉

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── admin/          # AdminLayout
│   ├── map/            # LocalCard, LocalDrawer, MapFilters
│   └── ui/             # Layout (bottom nav + sidebar)
├── lib/
│   ├── supabase.ts     # Cliente + tipos
│   └── utils.ts        # Haversine, distancias, horarios
├── pages/
│   ├── admin/          # AdminLocales, AdminPromos, AdminUsuarios, AdminResenas, AdminConfig
│   ├── MapaPage.tsx    # Página principal con mapa
│   ├── PromosPage.tsx  # Promos y ofertas
│   ├── LocalPage.tsx   # Detalle de sanguchería
│   ├── AuthPage.tsx    # Login / registro
│   ├── PerfilPage.tsx  # Perfil de usuario
│   └── ConfigPage.tsx  # Configuración
├── store/
│   └── appStore.ts     # Zustand: auth, location, filters, map
└── index.css           # Design system (CSS variables)
```

---

## 🎨 Design System

| Variable | Valor |
|----------|-------|
| `--c-gold` | #e8b84b |
| `--c-red` | #d94f3d |
| `--c-bg` | #0f0d0a |
| Font display | Fraunces (serif italic) |
| Font body | DM Sans |
| Font mono | DM Mono |

---

## 👥 Roles de usuario

| Rol | Permisos |
|-----|----------|
| `basico` | Mapa, búsqueda, promos públicas, reseñas |
| `pro` | Todo lo anterior + promos exclusivas PRO |
| `superadmin` | Todo + panel de administración |

---

## 🗺️ Mapa
Usa **Leaflet + OpenStreetMap** con tiles de CartoDB (dark mode). 100% gratuito, sin límites de uso, sin API key necesaria.

---

## 📱 Responsive
- **Mobile (< 768px)**: bottom nav con 4 tabs, mapa full screen, drawer deslizante
- **Desktop (≥ 768px)**: sidebar izquierdo fijo, panel flotante de lista sobre el mapa

---

## 💰 Módulo de monetización
- Promos con `visibilidad = 'pro'` → solo las ven usuarios PRO
- Promos con `tipo = 'publicidad'` → banners pagos de locales
- Para activar pagos: integrar Mercado Pago o Stripe y actualizar el rol a `pro` al completar el pago

---

## 🔜 Próximas features sugeridas
- [ ] Upload de fotos a Supabase Storage
- [ ] Notificaciones push (web push API)
- [ ] Compartir local (Web Share API)
- [ ] Modo offline (service worker)
- [ ] Panel de estadísticas para superadmin
- [ ] Sistema de pagos PRO (Mercado Pago)
