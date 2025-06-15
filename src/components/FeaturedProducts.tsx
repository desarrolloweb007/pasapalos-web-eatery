
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  category: 'comida_rapida' | 'especial' | 'extra' | 'bebida';
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
}

export const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      
      setFeaturedProducts(data as Product[] || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image_url || '/placeholder.svg',
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
    return `https://gezrpaubecdueuewdltq.supabase.co/storage/v1/object/public/product-images/${imageUrl}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay productos destacados disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="aspect-video bg-gradient-warm relative">
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <Badge className="absolute top-3 left-3">
              {product.category}
            </Badge>
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {renderStars(product.rating)}
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Button onClick={() => handleAddToCart(product)}>
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
