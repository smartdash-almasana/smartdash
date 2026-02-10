-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.capturas_riesgo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  escenario_id uuid NOT NULL,
  puntaje_global integer NOT NULL CHECK (puntaje_global >= 0 AND puntaje_global <= 100),
  nivel_riesgo_actual text NOT NULL CHECK (nivel_riesgo_actual = ANY (ARRAY['Bajo'::text, 'Medio'::text, 'Alto'::text, 'Crítico'::text])),
  senales jsonb DEFAULT '{}'::jsonb,
  contexto_financiero jsonb DEFAULT '{}'::jsonb,
  texto_recomendacion text,
  estado_accion text NOT NULL DEFAULT 'Pendiente'::text CHECK (estado_accion = ANY (ARRAY['Pendiente'::text, 'En Proceso'::text, 'Completado'::text, 'Descartado'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT capturas_riesgo_pkey PRIMARY KEY (id),
  CONSTRAINT capturas_riesgo_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT capturas_riesgo_escenario_id_fkey FOREIGN KEY (escenario_id) REFERENCES public.escenarios_riesgo(id)
);
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_comercial text NOT NULL,
  razon_social text NOT NULL,
  segmento text NOT NULL CHECK (segmento = ANY (ARRAY['Pyme'::text, 'E-commerce'::text, 'Startup'::text, 'Creador'::text])),
  email_contacto text NOT NULL,
  telefono text,
  metadata_negocio jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  img_clientes text,
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.escenarios_riesgo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vertical_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion_base text,
  nivel_riesgo_sugerido text NOT NULL CHECK (nivel_riesgo_sugerido = ANY (ARRAY['Bajo'::text, 'Medio'::text, 'Alto'::text, 'Crítico'::text])),
  puntaje_base integer NOT NULL CHECK (puntaje_base >= 0 AND puntaje_base <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT escenarios_riesgo_pkey PRIMARY KEY (id),
  CONSTRAINT escenarios_riesgo_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticales_negocio(id)
);
CREATE TABLE public.planes_mitigacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  captura_id uuid NOT NULL,
  pasos_accion jsonb DEFAULT '[]'::jsonb,
  fecha_limite date,
  responsable text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT planes_mitigacion_pkey PRIMARY KEY (id),
  CONSTRAINT planes_mitigacion_captura_id_fkey FOREIGN KEY (captura_id) REFERENCES public.capturas_riesgo(id)
);
CREATE TABLE public.verticales_negocio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verticales_negocio_pkey PRIMARY KEY (id)
);