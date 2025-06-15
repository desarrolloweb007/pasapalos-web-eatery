import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/components/admin/AdminStats';
import { ProductForm } from '@/components/admin/ProductForm';
import { InvoiceConfiguration } from '@/components/admin/InvoiceConfiguration';
import { InvoicePreview } from '@/components/admin/InvoicePreview';
import { FeaturedProductsManager } from '@/components/admin/FeaturedProductsManager';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { ProductEditDialog } from '@/components/admin/ProductEditDialog';
import { useAdminData } from '@/hooks/useAdminData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type OrderStatus = 'pendiente' | 'recibido' | 'en_espera' | 'cocinando' | 'pendiente_entrega' | 'entregado';

const AdminDashboard = () => {
  const { user, userProfile, loading: authLoading, initialized, isAuthenticated } = useAuth();
  const { orders, products, users, loading, error, refetchData, fetchProducts, fetchUsers, fetchOrders } = useAdminData(user?.id, isAuthenticated);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [invoiceConfig, setInvoiceConfig] = useState({
    nombre_restaurante: '',
    nit: '',
    direccion: '',
    ciudad_pais: '',
    telefono: '',
    email: '',
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

  // Order filters state
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    isToday: false,
    month: null as number | null,
  });

  const handleDeleteProduct = async (productId: string) => {
    if (!productId) return;

    try {
      console.log('Deleting product:', productId);
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del menú.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId || deletingOrderId === orderId) return;

    setDeletingOrderId(orderId);

    try {
      console.log('🗑️ Eliminando pedido usando función de base de datos:', orderId);
      
      // Usar la función de base de datos para eliminar de manera segura
      const { data, error } = await supabase.rpc('delete_order_safely', {
        order_uuid: orderId
      });

      if (error) {
        console.error('❌ Error en función delete_order_safely:', error);
        throw new Error(`Error eliminando el pedido: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo eliminar el pedido. Verifica que el pedido existe.');
      }

      console.log('✅ Pedido eliminado correctamente usando función de BD');

      // Refrescar los datos para actualizar la UI inmediatamente
      console.log('🔄 Actualizando lista de pedidos...');
      await refetchData();

      console.log('🎉 Eliminación completada exitosamente');

      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido eliminado correctamente.",
      });
    } catch (error: any) {
      console.error('💥 Error eliminando pedido:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleChangeUserRole = async (userId: string, newRoleId: number) => {
    if (!userId || !newRoleId) return;

    try {
      console.log('Changing user role:', userId, newRoleId);
      const { error } = await supabase
        .from('user_profiles')
        .update({ role_id: newRoleId })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente': return 'destructive';
      case 'recibido': return 'secondary';
      case 'en_espera': return 'default';
      case 'cocinando': return 'default';
      case 'pendiente_entrega': return 'secondary';
      case 'entregado': return 'default';
      default: return 'secondary';
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email;
    return 'Administrador';
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://gezrpaubecdueuewdltq.supabase.co/storage/v1/object/public/product-images/${imageUrl}`;
  };

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (orderFilters.search) {
      const searchLower = orderFilters.search.toLowerCase();
      if (!order.customer_name.toLowerCase().includes(searchLower) && 
          !order.id.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Today filter
    if (orderFilters.isToday) {
      const today = new Date();
      const orderDate = new Date(order.created_at);
      if (orderDate.toDateString() !== today.toDateString()) {
        return false;
      }
    }

    // Month filter
    if (orderFilters.month !== null) {
      const orderDate = new Date(order.created_at);
      const currentYear = new Date().getFullYear();
      if (orderDate.getMonth() !== orderFilters.month || orderDate.getFullYear() !== currentYear) {
        return false;
      }
    }

    return true;
  });

  const handleSearchChange = (search: string) => {
    setOrderFilters(prev => ({ ...prev, search }));
  };

  const handleTodayFilter = () => {
    setOrderFilters(prev => ({ 
      ...prev, 
      isToday: !prev.isToday,
      month: null // Clear month filter when activating today
    }));
  };

  const handleMonthFilter = (month: number) => {
    setOrderFilters(prev => ({ 
      ...prev, 
      month,
      isToday: false // Clear today filter when selecting month
    }));
  };

  const handleResetFilters = () => {
    setOrderFilters({
      search: '',
      isToday: false,
      month: null,
    });
  };

  // Show loading while auth is initializing
  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Inicializando aplicación...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/auth';
    return null;
  }

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetchData}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.is_active);
  const totalSales = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administrador</h1>
          <p className="text-muted-foreground">Bienvenido, {getUserDisplayName()}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="featured">Destacados</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats
              ordersCount={orders.length}
              productsCount={activeProducts.length}
              usersCount={users.length}
              totalSales={totalSales}
            />
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {user?.id && (
                <ProductForm 
                  onProductCreated={fetchProducts} 
                  userId={user.id} 
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Productos Existentes</CardTitle>
                  <CardDescription>
                    Gestiona los productos del menú ({activeProducts.length} activos)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activeProducts.length > 0 ? (
                      activeProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                              <Badge variant="secondary" className="mt-1">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción desactivará el producto "{product.name}" del menú. ¿Estás seguro?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No hay productos activos.</p>
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
              onProductUpdate={fetchProducts}
            />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>
                  Visualiza y gestiona todos los pedidos ({orders.length} total, {filteredOrders.length} mostrados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderFilters
                  onSearchChange={handleSearchChange}
                  onTodayFilter={handleTodayFilter}
                  onMonthFilter={handleMonthFilter}
                  onResetFilters={handleResetFilters}
                  activeFilters={orderFilters}
                />
                
                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">Pedido #{order.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">Cliente: {order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleString('es-CO')}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <Badge variant={getStatusBadgeVariant(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="text-lg font-bold text-primary mt-1">
                                {formatPrice(order.total_price)}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  disabled={deletingOrderId === order.id}
                                >
                                  {deletingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el pedido #{order.id.slice(0, 8)} de {order.customer_name}. ¿Estás seguro?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={deletingOrderId === order.id}
                                  >
                                    {deletingOrderId === order.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Eliminando...
                                      </>
                                    ) : (
                                      'Eliminar'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Productos:</p>
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item, index) => (
                              <div key={index} className="text-sm text-muted-foreground flex justify-between">
                                <span>{item.quantity}x {item.products?.name || 'Producto desconocido'}</span>
                                <span>{formatPrice(item.total_price)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No hay items en este pedido</p>
                          )}
                        </div>
                        {order.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium">Notas:</p>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {orderFilters.search || orderFilters.isToday || orderFilters.month !== null
                          ? 'No se encontraron pedidos con los filtros aplicados.'
                          : 'No hay pedidos registrados.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra los usuarios registrados y sus roles ({users.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length > 0 ? (
                    users.map((userItem) => (
                      <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{userItem.full_name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {userItem.id.slice(0, 8)}...</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={userItem.role_id === 1 ? 'default' : 'secondary'}>
                            {userItem.roles?.name || 'usuario'}
                          </Badge>
                          <Select
                            value={userItem.role_id.toString()}
                            onValueChange={(newRoleId) => handleChangeUserRole(userItem.id, parseInt(newRoleId))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">Usuario</SelectItem>
                              <SelectItem value="4">Mesero</SelectItem>
                              <SelectItem value="3">Cocinero</SelectItem>
                              <SelectItem value="2">Cajero</SelectItem>
                              <SelectItem value="1">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay usuarios registrados.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InvoiceConfiguration onConfigChange={setInvoiceConfig} />
              <InvoicePreview config={invoiceConfig} />
            </div>
          </TabsContent>
        </Tabs>

        {editingProduct && (
          <ProductEditDialog
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onProductUpdated={() => {
              fetchProducts();
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
