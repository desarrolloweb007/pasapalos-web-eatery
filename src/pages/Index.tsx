
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Star, Clock, Utensils, Heart } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  category: string;
  rating: number;
}

const Index = () => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;

      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: FeaturedProduct) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image_url,
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-primary text-primary' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'comida_rapida': 'Comidas Rápidas',
      'especial': 'Especiales',
      'extra': 'Extras',
      'bebida': 'Bebidas'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-yellow">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Casa de los Pasapalos
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
              Los mejores sabores venezolanos en cada bocado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                <Link to="/menu">Ver Menú Completo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                <Link to="#featured">Productos Destacados</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preparación Rápida</h3>
              <p className="text-muted-foreground">
                Tus platos favoritos listos en minutos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Utensils className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ingredientes Frescos</h3>
              <p className="text-muted-foreground">
                Solo utilizamos los mejores ingredientes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sabor Auténtico</h3>
              <p className="text-muted-foreground">
                Recetas tradicionales venezolanas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Productos Destacados
            </h2>
            <p className="text-xl text-muted-foreground">
              Lo más popular de nuestro menú
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando productos destacados...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
                    <div className="aspect-video bg-gradient-warm relative">
                      <img
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3">
                        {getCategoryDisplayName(item.category)}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="flex items-center gap-1">
                          {renderStars(item.rating)}
                          <span className="text-sm font-medium ml-1">{item.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(item.price)}
                        </span>
                        <Button onClick={() => handleAddToCart(item)}>
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {featuredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay productos destacados disponibles en este momento
                  </p>
                </div>
              )}

              <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                  <Link to="/menu">Ver Menú Completo</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para ordenar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explora nuestro menú completo y haz tu pedido ahora
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link to="/menu">Hacer Pedido</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
