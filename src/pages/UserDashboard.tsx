
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Search, 
  Download,
  Calendar,
  Clock,
  Package,
  User,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface Order {
  id: string;
  customer_name: string;
  total_price: number;
  status: string;
  created_at: string;
  notes?: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      price: number;
    };
  }[];
}

interface InvoiceConfig {
  id: string;
  nombre_restaurante: string;
  nit: string;
  direccion: string;
  ciudad_pais: string;
  telefono: string;
  email: string;
  logo_url?: string;
  color_primario: string;
  tipografia: string;
  posicion_logo: string;
  mensaje_personalizado?: string;
  mostrar_direccion: boolean;
  mostrar_id_pedido: boolean;
  mostrar_nombre_cliente: boolean;
  mostrar_estado_pedido: boolean;
  mostrar_fecha_hora: boolean;
}

export const UserDashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig | null>(null);

  // Cargar pedidos del usuario autenticado
  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          total_price,
          status,
          created_at,
          notes,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuración de facturación
  const fetchInvoiceConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_factura')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching invoice config:', error);
        return;
      }

      if (data) {
        setInvoiceConfig(data);
      }
    } catch (error) {
      console.error('Error fetching invoice config:', error);
    }
  };

  // Configurar realtime para escuchar cambios en pedidos
  useEffect(() => {
    if (!user) return;

    fetchUserOrders();
    fetchInvoiceConfig();

    const channel = supabase
      .channel('user-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filtrar pedidos por fecha
  useEffect(() => {
    const now = new Date();
    let filtered = [...orders];

    switch (dateFilter) {
      case 'today':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        });
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter]);

  // Buscar pedido por ID
  const handleSearchOrder = async () => {
    if (!searchOrderId.trim() || !user) {
      setSearchResult(null);
      return;
    }

    const cleanId = searchOrderId.replace('#', '');
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          total_price,
          status,
          created_at,
          notes,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              price
            )
          )
        `)
        .eq('id', cleanId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setSearchResult(null);
        toast({
          title: "Pedido no encontrado",
          description: "El ID del pedido no existe o no te pertenece",
          variant: "destructive",
        });
        return;
      }

      setSearchResult(data);
      toast({
        title: "¡Pedido encontrado!",
        description: `Pedido #${data.id.substring(0, 8)} - Estado: ${data.status}`,
      });
    } catch (error) {
      console.error('Error searching order:', error);
      setSearchResult(null);
      toast({
        title: "Error",
        description: "Error al buscar el pedido",
        variant: "destructive",
      });
    }
  };

  // Generar PDF de factura
  const generateInvoicePDF = (order: Order) => {
    if (!invoiceConfig) {
      toast({
        title: "Error de configuración",
        description: "No se encontró la configuración de facturación. Contacta al administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Header con logo y datos del restaurante
      let yPosition = 20;
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(invoiceConfig.color_primario);
      doc.text(invoiceConfig.nombre_restaurante || 'Casa de los Pasapalos', 20, yPosition);
      yPosition += 10;
      
      // Datos del restaurante
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      if (invoiceConfig.mostrar_direccion && invoiceConfig.nit) {
        doc.text(`NIT: ${invoiceConfig.nit}`, 20, yPosition);
        yPosition += 5;
      }
      if (invoiceConfig.mostrar_direccion && invoiceConfig.direccion) {
        doc.text(`Dirección: ${invoiceConfig.direccion}`, 20, yPosition);
        yPosition += 5;
      }
      if (invoiceConfig.mostrar_direccion && invoiceConfig.ciudad_pais) {
        doc.text(`${invoiceConfig.ciudad_pais}`, 20, yPosition);
        yPosition += 5;
      }
      if (invoiceConfig.mostrar_direccion && invoiceConfig.telefono) {
        doc.text(`Tel: ${invoiceConfig.telefono}`, 20, yPosition);
        yPosition += 5;
      }
      if (invoiceConfig.mostrar_direccion && invoiceConfig.email) {
        doc.text(`Email: ${invoiceConfig.email}`, 20, yPosition);
        yPosition += 5;
      }
      yPosition += 10;
      
      // Datos del pedido
      doc.setFontSize(14);
      doc.text('FACTURA ELECTRÓNICA', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      if (invoiceConfig.mostrar_id_pedido) {
        doc.text(`ID Pedido: #${order.id.substring(0, 8)}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_nombre_cliente) {
        doc.text(`Cliente: ${order.customer_name}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_fecha_hora) {
        const date = new Date(order.created_at);
        doc.text(`Fecha: ${format(date, 'dd/MM/yyyy', { locale: es })}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Hora: ${format(date, 'HH:mm:ss', { locale: es })}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_estado_pedido) {
        doc.text(`Estado: ${order.status}`, 20, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
      
      // Tabla de productos
      doc.text('PRODUCTOS:', 20, yPosition);
      yPosition += 5;
      
      // Headers de tabla
      doc.text('Producto', 20, yPosition);
      doc.text('Cant.', 100, yPosition);
      doc.text('Precio Unit.', 130, yPosition);
      doc.text('Subtotal', 170, yPosition);
      yPosition += 5;
      
      // Línea
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Productos
      order.order_items.forEach(item => {
        doc.text(item.products.name, 20, yPosition);
        doc.text(item.quantity.toString(), 100, yPosition);
        doc.text(`$${item.unit_price.toFixed(2)}`, 130, yPosition);
        doc.text(`$${item.total_price.toFixed(2)}`, 170, yPosition);
        yPosition += 5;
      });
      
      // Línea
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Total
      doc.setFontSize(12);
      doc.text(`TOTAL: $${order.total_price.toFixed(2)}`, 130, yPosition);
      yPosition += 15;
      
      // Mensaje personalizado
      if (invoiceConfig.mensaje_personalizado) {
        doc.setFontSize(10);
        doc.text(invoiceConfig.mensaje_personalizado, 20, yPosition);
      }
      
      // Guardar PDF
      doc.save(`factura-${order.id.substring(0, 8)}.pdf`);
      
      toast({
        title: "¡Factura generada!",
        description: "La factura se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Error al generar la factura",
        variant: "destructive",
      });
    }
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-500';
      case 'recibido': return 'bg-blue-500';
      case 'en espera': return 'bg-orange-500';
      case 'cocinando': return 'bg-purple-500';
      case 'pendiente entrega': return 'bg-indigo-500';
      case 'entregado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user || !userProfile) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Usuario</h1>
              <p className="text-gray-600">Bienvenido, {userProfile.full_name}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sección de Ordenar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingCart className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold">¿Deseas ordenar tu pedido?</h3>
                  <p className="text-gray-600">¡Hazlo ahora!</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/menu')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Ir al Menú
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sección principal - Mis Pedidos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Mis Pedidos</span>
                  </CardTitle>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoy</option>
                    <option value="week">Últimos 7 días</option>
                    <option value="month">Este mes</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Cargando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tienes pedidos para mostrar
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">#{order.id.substring(0, 8)}</span>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {order.status}
                            </Badge>
                          </div>
                          <span className="font-bold text-lg">${order.total_price.toFixed(2)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{order.customer_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(order.created_at), 'HH:mm:ss', { locale: es })}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Productos:</h4>
                          <ul className="space-y-1 text-sm">
                            {order.order_items.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>{item.products.name} x{item.quantity}</span>
                                <span>${item.total_price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={() => generateInvoicePDF(order)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Factura
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar derecho */}
          <div className="space-y-6">
            {/* Rastrear Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Rastrear Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Ingresa el ID del pedido (ej: #abc123)"
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
                  />
                  <Button 
                    onClick={handleSearchOrder}
                    className="w-full"
                    disabled={!searchOrderId.trim()}
                  >
                    Buscar Pedido
                  </Button>
                  
                  {searchResult && (
                    <div className="mt-4 p-4 border rounded-lg bg-green-50 border-green-200">
                      <h4 className="font-semibold mb-2 text-green-800">Pedido Encontrado</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>ID:</strong> #{searchResult.id.substring(0, 8)}</p>
                        <p className="flex items-center gap-2">
                          <strong>Estado:</strong> 
                          <Badge className={`${getStatusColor(searchResult.status)} text-white`}>
                            {searchResult.status}
                          </Badge>
                        </p>
                        <p><strong>Fecha:</strong> {format(new Date(searchResult.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                        <p><strong>Total:</strong> ${searchResult.total_price.toFixed(2)}</p>
                        <div>
                          <strong>Productos:</strong>
                          <ul className="mt-1 ml-4 space-y-1">
                            {searchResult.order_items.map((item) => (
                              <li key={item.id} className="text-xs">
                                • {item.products.name} x{item.quantity} - ${item.total_price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sección de Descargas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Descargas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Descarga las facturas de tus pedidos recientes
                </p>
                <div className="space-y-2">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">#{order.id.substring(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es })} - ${order.total_price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        onClick={() => generateInvoicePDF(order)}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      No hay pedidos para mostrar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
