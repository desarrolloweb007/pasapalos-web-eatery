
-- Crear tabla para configuración de facturación
CREATE TABLE public.configuracion_factura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Datos de la empresa
  nombre_restaurante TEXT NOT NULL DEFAULT '',
  nit TEXT NOT NULL DEFAULT '',
  direccion TEXT NOT NULL DEFAULT '',
  ciudad_pais TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  
  -- Configuración visual
  color_primario TEXT NOT NULL DEFAULT '#3B82F6',
  tipografia TEXT NOT NULL DEFAULT 'Arial' CHECK (tipografia IN ('Arial', 'Times New Roman', 'Roboto')),
  posicion_logo TEXT NOT NULL DEFAULT 'izquierda' CHECK (posicion_logo IN ('izquierda', 'centro', 'derecha')),
  
  -- Switches para mostrar/ocultar elementos
  mostrar_direccion BOOLEAN NOT NULL DEFAULT true,
  mostrar_nombre_cliente BOOLEAN NOT NULL DEFAULT true,
  mostrar_id_pedido BOOLEAN NOT NULL DEFAULT true,
  mostrar_estado_pedido BOOLEAN NOT NULL DEFAULT true,
  mostrar_fecha_hora BOOLEAN NOT NULL DEFAULT true,
  
  -- Mensaje personalizado
  mensaje_personalizado TEXT DEFAULT 'Gracias por su compra',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracion_factura ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - solo admin puede ver/editar
CREATE POLICY "Solo admin puede ver configuracion_factura" 
  ON public.configuracion_factura 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Solo admin puede insertar configuracion_factura" 
  ON public.configuracion_factura 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Solo admin puede actualizar configuracion_factura" 
  ON public.configuracion_factura 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_configuracion_factura_updated_at
    BEFORE UPDATE ON public.configuracion_factura
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Crear bucket de storage para logos de facturas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice-logos', 'invoice-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para logos
CREATE POLICY "Admin puede subir logos de factura" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'invoice-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Todos pueden ver logos de factura" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'invoice-logos');
