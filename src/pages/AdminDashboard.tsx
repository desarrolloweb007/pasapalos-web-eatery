
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Order } from '@/context/CartContext';
import { Plus, Users, Package, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  category: string;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    category: '',
    image: null as File | null,
  });

  useEffect(() => {
    // Load data from localStorage (in real app, this would be API calls)
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    setOrders(savedOrders);
    setProducts(savedProducts);
    setUsers(savedUsers);
  }, []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.description || !productForm.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description,
      ingredients: productForm.ingredients.split(',').map(ing => ing.trim()),
      category: productForm.category,
      image: '/placeholder.svg', // In real app, would handle file upload
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    // Reset form
    setProductForm({
      name: '',
      price: '',
      description: '',
      ingredients: '',
      category: '',
      image: null,
    });

    toast({
      title: "Producto creado",
      description: `${newProduct.name} ha sido agregado al menú.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del menú.",
    });
  };

  const handleChangeUserRole = (userId: string, newRole: UserRole) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Rol actualizado",
      description: "El rol del usuario ha sido actualizado correctamente.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pendiente': return 'destructive';
      case 'recibido': return 'secondary';
      case 'en espera': return 'default';
      case 'cocinado': return 'default';
      case 'pendiente de entrega': return 'secondary';
      case 'entregado': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administrador</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos en Menú</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Total</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Crear Nuevo Producto
                  </CardTitle>
                  <CardDescription>
                    Agrega un nuevo producto al menú del restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Nombre del producto</Label>
                      <Input
                        id="product-name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Ej: Arepa Reina Pepiada"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Precio (USD)</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Descripción</Label>
                      <Textarea
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Describe el producto..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-ingredients">Ingredientes (separados por coma)</Label>
                      <Input
                        id="product-ingredients"
                        value={productForm.ingredients}
                        onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                        placeholder="Pollo, Aguacate, Mayonesa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-category">Categoría</Label>
                      <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comidas-rapidas">Comidas Rápidas</SelectItem>
                          <SelectItem value="especiales">Especiales</SelectItem>
                          <SelectItem value="extras">Extras</SelectItem>
                          <SelectItem value="bebidas">Bebidas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Crear Producto
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Existentes</CardTitle>
                  <CardDescription>
                    Gestiona los productos del menú
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                          <Badge variant="secondary" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Todos los Pedidos</CardTitle>
                <CardDescription>
                  Visualiza todos los pedidos realizados en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">Pedido #{order.id}</h4>
                          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString('es-VE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-lg font-bold text-primary mt-1">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Productos:</p>
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay pedidos registrados.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra los usuarios registrados y sus roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{userItem.name}</h4>
                        <p className="text-sm text-muted-foreground">{userItem.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                          {userItem.role}
                        </Badge>
                        <Select
                          value={userItem.role}
                          onValueChange={(newRole) => handleChangeUserRole(userItem.id, newRole as UserRole)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usuario">Usuario</SelectItem>
                            <SelectItem value="mesero">Mesero</SelectItem>
                            <SelectItem value="cocinero">Cocinero</SelectItem>
                            <SelectItem value="cajero">Cajero</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
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
