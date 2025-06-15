
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedProductControlsProps {
  productId: string;
  currentFeatured: boolean;
  currentRating: number;
  onUpdate: () => void;
}

export const FeaturedProductControls: React.FC<FeaturedProductControlsProps> = ({
  productId,
  currentFeatured,
  currentRating,
  onUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFeatured, setIsFeatured] = useState(currentFeatured);
  const [rating, setRating] = useState(currentRating.toString());

  const handleUpdateProduct = async () => {
    setIsUpdating(true);
    try {
      const ratingValue = parseFloat(rating);
      
      if (ratingValue < 0 || ratingValue > 5) {
        toast({
          title: "Error",
          description: "La calificación debe estar entre 0 y 5.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({
          is_featured: isFeatured,
          rating: ratingValue
        })
        .eq('id', productId);

      if (error) throw error;

      onUpdate();
      
      toast({
        title: "Producto actualizado",
        description: "La configuración del producto ha sido actualizada.",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = (currentRating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center space-x-2">
        <Switch
          id={`featured-${productId}`}
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
          disabled={isUpdating}
        />
        <Label htmlFor={`featured-${productId}`}>Producto destacado</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`rating-${productId}`}>Calificación (0-5)</Label>
        <div className="flex items-center gap-3">
          <Input
            id={`rating-${productId}`}
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-20"
            disabled={isUpdating}
          />
          {renderStars(parseFloat(rating) || 0)}
        </div>
      </div>

      <Button 
        onClick={handleUpdateProduct} 
        disabled={isUpdating}
        size="sm"
        className="w-full"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          'Actualizar'
        )}
      </Button>
    </div>
  );
};
