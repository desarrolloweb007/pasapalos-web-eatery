
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { Search, Star, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Sample menu data
const menuItems = [
  // Comidas Rápidas
  {
    id: '1',
    name: 'Arepa Reina Pepiada',
    price: 4.50,
    description: 'Deliciosa arepa rellena con pollo y aguacate cremoso',
    image: '/placeholder.svg',
    category: 'comidas-rapidas',
    rating: 4.8,
    ingredients: ['Pollo', 'Aguacate', 'Mayonesa', 'Arepa'],
  },
  {
    id: '2',
    name: 'Pepito de Pollo',
    price: 6.00,
    description: 'Pan francés con pollo, lechuga, tomate y salsas especiales',
    image: '/placeholder.svg',
    category: 'comidas-rapidas',
    rating: 4.9,
    ingredients: ['Pan francés', 'Pollo', 'Lechuga', 'Tomate', 'Salsas'],
  },
  {
    id: '3',
    name: 'Hamburguesa Casa',
    price: 7.50,
    description: 'Hamburguesa artesanal con carne 100% res, queso y vegetales',
    image: '/placeholder.svg',
    category: 'comidas-rapidas',
    rating: 4.7,
    ingredients: ['Carne de res', 'Queso', 'Lechuga', 'Tomate', 'Cebolla'],
  },
  
  // Especiales
  {
    id: '4',
    name: 'Pabellón Criollo',
    price: 12.00,
    description: 'Plato típico venezolano con carne mechada, caraotas, arroz y tajadas',
    image: '/placeholder.svg',
    category: 'especiales',
    rating: 4.9,
    ingredients: ['Carne mechada', 'Caraotas negras', 'Arroz', 'Plátano maduro'],
  },
  {
    id: '5',
    name: 'Asado Negro',
    price: 14.00,
    description: 'Tradicional asado negro venezolano con acompañantes',
    image: '/placeholder.svg',
    category: 'especiales',
    rating: 4.8,
    ingredients: ['Carne de res', 'Papelón', 'Especias', 'Acompañantes'],
  },
  
  // Extras
  {
    id: '6',
    name: 'Tequeños (6 unidades)',
    price: 3.50,
    description: 'Tequeños caseros crujientes rellenos de queso blanco',
    image: '/placeholder.svg',
    category: 'extras',
    rating: 4.7,
    ingredients: ['Masa de trigo', 'Queso blanco'],
  },
  {
    id: '7',
    name: 'Cachapas con Queso',
    price: 5.00,
    description: 'Cachapas de maíz dulce con queso de mano',
    image: '/placeholder.svg',
    category: 'extras',
    rating: 4.6,
    ingredients: ['Maíz dulce', 'Queso de mano'],
  },
  
  // Bebidas
  {
    id: '8',
    name: 'Chicha Criolla',
    price: 2.50,
    description: 'Bebida tradicional venezolana de arroz con canela',
    image: '/placeholder.svg',
    category: 'bebidas',
    rating: 4.5,
    ingredients: ['Arroz', 'Leche', 'Canela', 'Azúcar'],
  },
  {
    id: '9',
    name: 'Jugo Natural',
    price: 2.00,
    description: 'Jugos naturales de frutas tropicales',
    image: '/placeholder.svg',
    category: 'bebidas',
    rating: 4.4,
    ingredients: ['Frutas naturales', 'Agua', 'Azúcar'],
  },
];

const categories = [
  { id: 'todos', name: 'Todos', value: 'todos' },
  { id: 'comidas-rapidas', name: 'Comidas Rápidas', value: 'comidas-rapidas' },
  { id: 'especiales', name: 'Especiales', value: 'especiales' },
  { id: 'extras', name: 'Extras', value: 'extras' },
  { id: 'bebidas', name: 'Bebidas', value: 'bebidas' },
];

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { addItem } = useCart();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
    });
    
    toast({
      title: "Producto agregado",
      description: `${item.name} se ha agregado a tu carrito.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

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
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary">
                    {categories.find(cat => cat.value === item.category)?.name}
                  </Badge>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium">{item.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-3 text-sm line-clamp-2">
                    {item.description}
                  </p>
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
          {filteredItems.length === 0 && (
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
