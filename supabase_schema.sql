-- ============================================================
-- MILAPP - Schema SQL para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Extensión para coordenadas geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- ENUM: roles de usuario
-- ============================================================
CREATE TYPE user_role AS ENUM ('superadmin', 'pro', 'basico');

-- ============================================================
-- TABLA: perfiles de usuario (extiende auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'basico',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfil propio visible" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Perfil propio editable" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Superadmin ve todos" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nombre');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLA: sangucherías / locales
-- ============================================================
CREATE TABLE locales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  barrio TEXT,
  ciudad TEXT DEFAULT 'San Miguel de Tucumán',
  provincia TEXT DEFAULT 'Tucumán',
  telefono TEXT,
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  sitio_web TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  horario_apertura TIME,
  horario_cierre TIME,
  dias_abierto TEXT[], -- ['lunes','martes',...] 
  precio_promedio NUMERIC(10,2),
  calificacion_promedio NUMERIC(3,2) DEFAULT 0,
  total_resenas INTEGER DEFAULT 0,
  tiene_delivery BOOLEAN DEFAULT false,
  tiene_local_fisico BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  verificado BOOLEAN DEFAULT false,
  foto_portada TEXT,
  fotos TEXT[],
  tags TEXT[], -- ['crujiente','casera','abundante',...]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE locales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locales visibles a todos" ON locales
  FOR SELECT USING (activo = true);

CREATE POLICY "Solo superadmin puede crear/editar locales" ON locales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Índice espacial
CREATE INDEX locales_location_idx ON locales USING btree (lat, lng);

-- ============================================================
-- TABLA: menú / productos de cada local
-- ============================================================
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2),
  foto TEXT,
  categoria TEXT DEFAULT 'sandwich', -- sandwich, extra, bebida, combo
  disponible BOOLEAN DEFAULT true,
  es_destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productos visibles" ON productos FOR SELECT USING (true);
CREATE POLICY "Admin gestiona productos" ON productos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- ============================================================
-- TABLA: reseñas
-- ============================================================
CREATE TABLE resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5) NOT NULL,
  comentario TEXT,
  fotos TEXT[],
  aprobada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(local_id, user_id)
);

ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reseñas aprobadas visibles" ON resenas FOR SELECT USING (aprobada = true);
CREATE POLICY "Usuario puede crear reseña" ON resenas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuario puede ver su reseña" ON resenas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin ve todas las reseñas" ON resenas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Trigger: actualizar promedio de calificación al aprobar reseña
CREATE OR REPLACE FUNCTION update_local_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE locales SET
    calificacion_promedio = (
      SELECT ROUND(AVG(calificacion)::NUMERIC, 2)
      FROM resenas WHERE local_id = NEW.local_id AND aprobada = true
    ),
    total_resenas = (
      SELECT COUNT(*) FROM resenas WHERE local_id = NEW.local_id AND aprobada = true
    ),
    updated_at = now()
  WHERE id = NEW.local_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_resena_change
  AFTER INSERT OR UPDATE ON resenas
  FOR EACH ROW EXECUTE FUNCTION update_local_rating();

-- ============================================================
-- TABLA: promociones y publicidades
-- ============================================================
CREATE TYPE promo_tipo AS ENUM ('descuento', 'combo', '2x1', 'envio_gratis', 'publicidad', 'destacado');
CREATE TYPE promo_visibilidad AS ENUM ('todos', 'pro', 'superadmin');

CREATE TABLE promociones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen TEXT,
  tipo promo_tipo DEFAULT 'publicidad',
  visibilidad promo_visibilidad DEFAULT 'todos',
  descuento_porcentaje NUMERIC(5,2),
  codigo_descuento TEXT,
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  activa BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promos activas visibles a todos" ON promociones
  FOR SELECT USING (
    activa = true AND
    (fecha_fin IS NULL OR fecha_fin > now()) AND
    (
      visibilidad = 'todos' OR
      (visibilidad = 'pro' AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('pro','superadmin')
      )) OR
      (visibilidad = 'superadmin' AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin'
      ))
    )
  );

CREATE POLICY "Admin gestiona promos" ON promociones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- ============================================================
-- TABLA: favoritos del usuario
-- ============================================================
CREATE TABLE favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, local_id)
);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Favoritos propios" ON favoritos
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLA: configuración general de la app
-- ============================================================
CREATE TABLE config_app (
  key TEXT PRIMARY KEY,
  value JSONB,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE config_app ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config visible a todos" ON config_app FOR SELECT USING (true);
CREATE POLICY "Solo superadmin edita config" ON config_app
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Valores iniciales de configuración
INSERT INTO config_app (key, value, descripcion) VALUES
  ('app_nombre', '"MILAPP"', 'Nombre de la app'),
  ('app_subtitulo', '"Las mejores milanesadas de Tucumán"', 'Subtítulo'),
  ('mapa_centro_lat', '-26.8241', 'Latitud centro del mapa'),
  ('mapa_centro_lng', '-65.2226', 'Longitud centro del mapa'),
  ('mapa_zoom_inicial', '13', 'Zoom inicial del mapa'),
  ('radio_cercanos_km', '3', 'Radio en km para buscar locales cercanos'),
  ('mantenimiento', 'false', 'Modo mantenimiento activo'),
  ('registro_abierto', 'true', 'Permite registro de nuevos usuarios');

-- ============================================================
-- STORAGE BUCKETS (ejecutar desde el dashboard de Supabase)
-- ============================================================
-- Crear manualmente en Storage:
-- Bucket: "locales-fotos"    → público
-- Bucket: "promos-imagenes"  → público
-- Bucket: "avatars"          → público

-- ============================================================
-- DATOS DE EJEMPLO (algunos locales reales de Tucumán)
-- ============================================================
INSERT INTO locales (nombre, descripcion, direccion, barrio, lat, lng, telefono, tiene_delivery, activo, verificado, tags) VALUES
('El Fortín de la Milanesa', 'Las milanesas más grandes de Tucumán. Clásico del centro.', 'Av. Mate de Luna 2500', 'Centro', -26.8241, -65.2226, '381-4001234', true, true, true, ARRAY['grande','crujiente','clásico']),
('La Sanguchería del Parque', 'Frente al parque 9 de Julio. Ambiente familiar.', 'Av. Alem 501', 'Parque 9 de Julio', -26.8189, -65.2098, '381-4005678', false, true, true, ARRAY['familiar','económico']),
('Mila Express', 'Delivery rápido de milanesas artesanales.', 'Mendoza 750', 'Sur', -26.8310, -65.2180, '381-4009876', true, true, false, ARRAY['delivery','artesanal','rápido']),
('Don Mila', 'El clásico barrio Jardín. Más de 20 años de historia.', 'Av. Belgrano 3200', 'Jardín', -26.8100, -65.2350, '381-4003344', false, true, true, ARRAY['tradicional','casera','historia']),
('Milas & Beer', 'Milanesas con cerveza artesanal. Ideal para la noche.', 'Congreso 450', 'Nueva Córdoba', -26.8290, -65.2090, '381-4007788', true, true, false, ARRAY['nocturno','cerveza','joven']);
