
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[] | null;
  category: 'comida_rapida' | 'especial' | 'extra' | 'bebida';
  price: number;
  image_url: string | null;
  is_active: boolean;
}

const categories = [
  { id: 'todos', name: 'Todos', value: 'todos' },
  { id: 'comida_rapida', name: 'Comidas Rápidas', value: 'comida_rapida' },
  { id: 'especial', name: 'Especiales', value: 'especial' },
  { id: 'extra', name: 'Extras', value: 'extra' },
  { id: 'bebida', name: 'Bebidas', value: 'bebida' },
];

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Type assertion to ensure proper category types
      const typedProducts = (data || []).map(product => ({
        ...product,
        category: product.category as 'comida_rapida' | 'especial' | 'extra' | 'bebida'
      }));

      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: Product) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || '',
      image: item.image_url || '/placeholder.svg',
    });
    
    toast({
      title: "Producto agregado",
      description: `${item.name} se ha agregado a tu carrito.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http')) return imageUrl;
    // Use the proper Supabase URL construction
    return `https://gezrpaubecdueuewdltq.supabase.co/storage/v1/object/public/product-images/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">Nuestro Menú</h1>
          <p className="text-xl text-muted-foreground">
            Descubre los sabores auténticos de Venezuela
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.value} className="text-sm">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="aspect-square bg-gradient-warm relative">
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <Badge className="absolute top-3 left-3 bg-primary">
                    {categories.find(cat => cat.value === item.category)?.name}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-muted-foreground mb-3 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.ingredients.slice(0, 3).map((ingredient, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {item.ingredients.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.ingredients.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(item.price)}
                    </span>
                    <Button onClick={() => handleAddToCart(item)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results */}
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o selecciona una categoría diferente.
              </p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Menu;
