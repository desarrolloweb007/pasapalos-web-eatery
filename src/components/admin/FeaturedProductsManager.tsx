
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, StarOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  is_featured: boolean;
  rating: number;
  category: string;
}

interface FeaturedProductsManagerProps {
  products: Product[];
  onProductUpdate: () => void;
}

export const FeaturedProductsManager: React.FC<FeaturedProductsManagerProps> = ({ 
  products, 
  onProductUpdate 
}) => {
  const [updatingProducts, setUpdatingProducts] = useState<Set<string>>(new Set());

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    setUpdatingProducts(prev => new Set(prev).add(productId));
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Producto actualizado",
        description: `El producto ha sido ${!currentStatus ? 'marcado como destacado' : 'removido de destacados'}.`,
      });

      onProductUpdate();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRatingChange = async (productId: string, rating: number) => {
    setUpdatingProducts(prev => new Set(prev).add(productId));
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ rating })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Calificación actualizada",
        description: `La calificación ha sido actualizada a ${rating} estrellas.`,
      });

      onProductUpdate();
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calificación.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const renderStars = (productId: string, currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
          onClick={() => handleRatingChange(productId, starValue)}
          disabled={updatingProducts.has(productId)}
        >
          {starValue <= currentRating ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4 text-gray-300" />
          )}
        </Button>
      );
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Productos Destacados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{product.name}</h4>
                  {product.is_featured && (
                    <Badge variant="secondary">Destacado</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {product.description}
                </p>
                <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-muted-foreground">Calificación:</span>
                  {renderStars(product.id, product.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.rating}/5
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant={product.is_featured ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                  disabled={updatingProducts.has(product.id)}
                >
                  {product.is_featured ? "Quitar destacado" : "Hacer destacado"}
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay productos disponibles
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
