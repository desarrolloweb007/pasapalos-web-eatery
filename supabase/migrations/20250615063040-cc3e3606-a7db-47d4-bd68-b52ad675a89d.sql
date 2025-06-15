
-- Primero, verificar las relaciones existentes y agregar foreign keys si no existen
-- Esto asegurará que podamos eliminar correctamente

-- Agregar foreign key de order_items a orders si no existe
DO $$ 
BEGIN
    -- Verificar si la foreign key ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey' 
        AND table_name = 'order_items'
    ) THEN
        -- Agregar la foreign key con ON DELETE CASCADE
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar foreign key de order_items a products si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_product_id_fkey' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id);
    END IF;
END $$;

-- Crear una función para eliminar pedidos de manera segura
CREATE OR REPLACE FUNCTION delete_order_safely(order_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Eliminar primero los items del pedido
    DELETE FROM order_items WHERE order_id = order_uuid;
    
    -- Luego eliminar el pedido
    DELETE FROM orders WHERE id = order_uuid;
    
    -- Retornar true si se eliminó correctamente
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, hacer rollback automático
        RAISE EXCEPTION 'Error eliminando pedido: %', SQLERRM;
        RETURN FALSE;
END;
$$;
