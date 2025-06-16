
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, TrendingUp } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  is_featured: boolean;
}

export const UserDestacados = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
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
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <span className="text-xl text-orange-800">Productos Destacados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Descubre nuestros productos más populares y mejor valorados por nuestros clientes.
          </p>
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ver Menú Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      {featuredProducts.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="text-center py-12">
            <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No hay productos destacados</p>
            <p className="text-sm text-gray-400">
              Los productos destacados aparecerán aquí cuando estén disponibles
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-orange-100">
              {/* Featured Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-orange-500 text-white font-medium">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                </div>
                
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    {product.category}
                  </Badge>
                </div>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate('/menu')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ordenar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <Card className="bg-white border-orange-200">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¿No encuentras lo que buscas?
          </h3>
          <p className="text-gray-600 mb-4">
            Explora nuestro menú completo con todos los productos disponibles
          </p>
          <Button 
            onClick={() => navigate('/menu')}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            Ver Todos los Productos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
