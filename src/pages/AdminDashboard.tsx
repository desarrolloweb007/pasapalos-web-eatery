
import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/components/admin/AdminStats';
import { ProductForm } from '@/components/admin/ProductForm';
import { FeaturedProductControls } from '@/components/admin/FeaturedProductControls';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { useAdminData } from '@/hooks/useAdminData';

type OrderStatus = 'pendiente' | 'recibido' | 'en_espera' | 'cocinando' | 'pendiente_entrega' | 'entregado';

const AdminDashboard = () => {
  const { user, userProfile, loading: authLoading, initialized, isAuthenticated } = useAuth();
  const { orders, products, users, loading, error, refetchData, fetchProducts, fetchUsers, deleteOrder } = useAdminData(user?.id, isAuthenticated);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Order filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter orders based on search criteria
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by search term (customer name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by today only
    if (showTodayOnly) {
      const today = new Date().toDateString();
      filtered = filtered.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, showTodayOnly, statusFilter]);

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
    const success = await deleteOrder(orderId);
    if (!success) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido.",
        variant: "destructive",
      });
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
          <p className="text-mute-foreground">Bienvenido, {getUserDisplayName()}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
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
                        <div key={product.id} className="space-y-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
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
                              <Button variant="outline" size="sm">
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
                                      Esta acción eliminará permanentemente el producto "{product.name}" del menú.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <FeaturedProductControls
                            productId={product.id}
                            currentFeatured={product.is_featured || false}
                            currentRating={product.rating || 0}
                            onUpdate={fetchProducts}
                          />
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

          <TabsContent value="orders">
            <div className="space-y-6">
              <OrderFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showTodayOnly={showTodayOnly}
                onTodayFilterChange={setShowTodayOnly}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos {showTodayOnly ? 'de Hoy' : 'Totales'}</CardTitle>
                  <CardDescription>
                    {filteredOrders.length} pedido(s) {searchTerm && `encontrado(s) para "${searchTerm}"`}
                    {statusFilter !== 'all' && ` con estado "${statusFilter}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                            <div className="text-right flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {order.status}
                                </Badge>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción eliminará permanentemente el pedido #{order.id.slice(0, 8)} de {order.customer_name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(order.total_price)}
                              </p>
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
                          {searchTerm || statusFilter !== 'all' || showTodayOnly 
                            ? 'No se encontraron pedidos con los filtros aplicados.' 
                            : 'No hay pedidos registrados.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
