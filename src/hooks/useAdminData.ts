
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type OrderStatus = 'pendiente' | 'recibido' | 'en_espera' | 'cocinando' | 'pendiente_entrega' | 'entregado';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  category: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  role_id: number;
  roles?: {
    name: string;
  };
}

interface DatabaseOrder {
  id: string;
  customer_name: string;
  user_id: string | null;
  total_price: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
    };
  }[];
}

export const useAdminData = (userId: string | undefined, isAuthenticated: boolean) => {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId || !isAuthenticated) return;
    
    try {
      console.log('Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedOrders = (data || []).map(order => ({
        ...order,
        status: order.status as OrderStatus
      }));
      
      console.log('Orders fetched successfully:', typedOrders.length);
      setOrders(typedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error al cargar los pedidos');
      setOrders([]);
    }
  }, [userId, isAuthenticated]);

  const fetchProducts = useCallback(async () => {
    if (!userId || !isAuthenticated) return;
    
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Asegurar que los productos tengan los campos requeridos
      const typedProducts = (data || []).map(product => ({
        ...product,
        is_featured: product.is_featured ?? false,
        rating: product.rating ?? 0,
        ingredients: product.ingredients ?? []
      }));
      
      console.log('Products fetched successfully:', typedProducts.length);
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error al cargar los productos');
      setProducts([]);
    }
  }, [userId, isAuthenticated]);

  const fetchUsers = useCallback(async () => {
    if (!userId || !isAuthenticated) return;
    
    try {
      console.log('Fetching users...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          role_id,
          roles (name)
        `)
        .order('full_name');

      if (error) throw error;
      
      console.log('Users fetched successfully:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar los usuarios');
      setUsers([]);
    }
  }, [userId, isAuthenticated]);

  const initializeData = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
      toast({
        title: "Error",
        description: "Error al cargar los datos del dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated, fetchOrders, fetchProducts, fetchUsers]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Set up realtime subscription for products
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          console.log('Products changed, refetching...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchProducts]);

  const refetchData = useCallback(() => {
    initializeData();
  }, [initializeData]);

  return {
    orders,
    products,
    users,
    loading,
    error,
    refetchData,
    fetchOrders,
    fetchProducts,
    fetchUsers
  };
};
