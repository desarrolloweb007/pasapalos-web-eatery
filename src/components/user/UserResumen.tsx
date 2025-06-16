
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderSummary {
  total_orders: number;
  total_spent: number;
  last_order?: {
    id: string;
    created_at: string;
    status: string;
    total_price: number;
  };
}

export const UserResumen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<OrderSummary>({
    total_orders: 0,
    total_spent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrderSummary();
    }
  }, [user]);

  const fetchOrderSummary = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total_price')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const lastOrder = orders?.[0];

      setSummary({
        total_orders: totalOrders,
        total_spent: totalSpent,
        last_order: lastOrder
      });
    } catch (error) {
      console.error('Error fetching order summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.total_orders}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${summary.total_spent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Último Pedido</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {summary.last_order ? (
              <div>
                <div className="text-lg font-bold text-gray-900">
                  #{summary.last_order.id.substring(0, 8)}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(summary.last_order.created_at), 'dd/MM/yyyy', { locale: es })}
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  {summary.last_order.status}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin pedidos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hacer un Nuevo Pedido</h3>
                <p className="text-gray-600 text-sm">Explora nuestro menú y haz tu pedido</p>
              </div>
              <Button 
                onClick={() => navigate('/menu')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ver Historial Completo</h3>
                <p className="text-gray-600 text-sm">Revisa todos tus pedidos anteriores</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {/* This would switch to pedidos tab - implement in parent */}}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Package className="h-4 w-4 mr-2" />
                Ver Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Order Details */}
      {summary.last_order && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Último Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <div className="font-medium">#{summary.last_order.id.substring(0, 8)}</div>
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>
                <div className="font-medium">
                  {format(new Date(summary.last_order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="font-medium text-orange-600">{summary.last_order.status}</div>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <div className="font-medium">${summary.last_order.total_price.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
