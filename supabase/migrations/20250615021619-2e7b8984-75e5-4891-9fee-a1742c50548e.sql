
-- Agregar campos destacado y calificacion a la tabla products
ALTER TABLE public.products 
ADD COLUMN is_featured boolean DEFAULT false,
ADD COLUMN rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

-- Habilitar replica identity para actualizaciones en tiempo real
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Agregar tabla a la publicación de realtime para actualizaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.products.is_featured IS 'Indica si el producto está destacado en la página principal';
COMMENT ON COLUMN public.products.rating IS 'Calificación del producto del 1 al 5';
