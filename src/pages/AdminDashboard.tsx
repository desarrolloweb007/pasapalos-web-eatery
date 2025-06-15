
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { useAdminData } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/components/admin/AdminStats';
import { ProductForm } from '@/components/admin/ProductForm';
import { FeaturedProductsManager } from '@/components/admin/FeaturedProductsManager';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { InvoiceConfiguration } from '@/components/admin/InvoiceConfiguration';
import { InvoicePreview } from '@/components/admin/InvoicePreview';
import { Package, Users, ShoppingCart, Settings, Trash2, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type OrderStatus = 'pendiente' | 'recibido' | 'en_espera' | 'cocinando' | 'pendiente_entrega' | 'entregado';

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const { orders, products, users, loading, error, refetchData } = useAdminData(user?.id, !!user);
  
  // Estados para filtros de pedidos
  const [searchTerm, setSearchTerm] = useState('');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estado para eliminar pedidos
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);

  // Estado para la configuración de facturas
  const [invoiceConfig, setInvoiceConfig] = useState({
    nombre_restaurante: 'Casa de los Pasapalos',
    nit: '900123456-7',
    direccion: 'Calle 123 #45-67',
    ciudad_pais: 'Bogotá, Colombia',
    telefono: '+57 300 123 4567',
    email: 'info@casapasapalos.com',
    logo_url: '',
    color_primario: '#3B82F6',
    tipografia: 'Arial',
    posicion_logo: 'izquierda',
    mostrar_direccion: true,
    mostrar_nombre_cliente: true,
    mostrar_id_pedido: true,
    mostrar_estado_pedido: true,
    mostrar_fecha_hora: true,
    mensaje_personalizado: 'Gracias por su compra',
  });

  // Configurar realtime para pedidos
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          console.log('Orders changed, refetching...');
          refetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchData]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    // Filtro de búsqueda
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de fecha (solo hoy)
    let matchesDate = true;
    if (showTodayOnly) {
      const today = new Date().toDateString();
      const orderDate = new Date(order.created_at).toDateString();
      matchesDate = today === orderDate;
    }
    
    // Filtro de estado
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado.",
      });

      refetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    
    try {
      // Primero eliminar los items del pedido
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Luego eliminar el pedido
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido eliminado correctamente.",
      });

      refetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrder(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'default';
      case 'recibido': return 'secondary';
      case 'en_espera': return 'outline';
      case 'cocinando': return 'destructive';
      case 'pendiente_entrega': return 'default';
      case 'entregado': return 'default';
      default: return 'default';
    }
  };

  if (!user || userProfile?.role_id !== 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso denegado</h1>
          <p>No tienes permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">
          Error al cargar los datos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona pedidos, productos y configuración del restaurante
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="featured">Destacados</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <AdminStats 
            orders={orders}
            products={products}
            users={users}
          />
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Gestión de Pedidos
              </CardTitle>
              <CardDescription>
                Visualiza y gestiona todos los pedidos del restaurante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showTodayOnly={showTodayOnly}
                onToggleTodayOnly={() => setShowTodayOnly(!showTodayOnly)}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
              
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeColor(order.status || 'pendiente')}>
                            {order.status || 'pendiente'}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={deletingOrder === order.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el pedido y todos sus elementos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.products.name}</span>
                            <span>{formatPrice(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-semibold">
                          Total: {formatPrice(order.total_price)}
                        </span>
                        <Select
                          value={order.status || 'pendiente'}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="recibido">Recibido</SelectItem>
                            <SelectItem value="en_espera">En espera</SelectItem>
                            <SelectItem value="cocinando">Cocinando</SelectItem>
                            <SelectItem value="pendiente_entrega">Pendiente entrega</SelectItem>
                            <SelectItem value="entregado">Entregado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || showTodayOnly || statusFilter !== 'all' 
                      ? 'No se encontraron pedidos con los filtros aplicados'
                      : 'No hay pedidos registrados'
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-6">
            <ProductForm 
              onProductCreated={refetchData}
              userId={user.id}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        {product.is_featured && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay productos registrados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="featured">
          <FeaturedProductsManager
            products={products}
            onProductUpdate={refetchData}
          />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios Registrados ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div key={userItem.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h3 className="font-medium">{userItem.full_name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {userItem.id}</p>
                    </div>
                    <Badge variant="outline">
                      {userItem.roles?.name || 'Sin rol'}
                    </Badge>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay usuarios registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="grid gap-6 lg:grid-cols-2">
            <InvoiceConfiguration onConfigChange={setInvoiceConfig} />
            <InvoicePreview config={invoiceConfig} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
