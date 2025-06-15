
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_featured?: boolean;
  rating?: number;
}

interface FeaturedProductsManagerProps {
  products: Product[];
  onProductUpdate: () => void;
}

export const FeaturedProductsManager: React.FC<FeaturedProductsManagerProps> = ({
  products,
  onProductUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [rating, setRating] = useState('0');

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
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

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFeatured(product.is_featured || false);
    setRating((product.rating || 0).toString());
    setIsDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_featured: isFeatured,
          rating: parseFloat(rating)
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Producto actualizado",
        description: "Los cambios se han guardado correctamente.",
      });

      setIsDialogOpen(false);
      onProductUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const activeProducts = products.filter(p => p.is_active);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Destacados</CardTitle>
        <CardDescription>
          Gestiona qué productos aparecen destacados en la landing page
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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={product.is_featured ? "default" : "secondary"}>
                        {product.is_featured ? "Destacado" : "Normal"}
                      </Badge>
                      {product.is_featured && (
                        <div className="flex items-center gap-1">
                          {renderStars(product.rating || 0)}
                          <span className="text-sm text-muted-foreground ml-1">
                            {product.rating || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Producto Destacado</DialogTitle>
                      <DialogDescription>
                        Configura si este producto aparece como destacado y su calificación
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={isFeatured}
                          onCheckedChange={setIsFeatured}
                        />
                        <Label htmlFor="featured">Producto destacado</Label>
                      </div>
                      {isFeatured && (
                        <div>
                          <Label htmlFor="rating">Calificación (estrellas)</Label>
                          <Select value={rating} onValueChange={setRating}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0 estrellas</SelectItem>
                              <SelectItem value="1">1 estrella</SelectItem>
                              <SelectItem value="2">2 estrellas</SelectItem>
                              <SelectItem value="3">3 estrellas</SelectItem>
                              <SelectItem value="4">4 estrellas</SelectItem>
                              <SelectItem value="5">5 estrellas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateProduct}>
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
  );
};
