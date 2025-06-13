
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProductFormProps {
  onProductCreated: () => void;
  userId: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated, userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    category: '',
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.description || !productForm.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newProduct = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        description: productForm.description.trim(),
        ingredients: productForm.ingredients ? productForm.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0) : [],
        category: productForm.category,
        created_by: userId,
        is_active: true,
      };

      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;

      setProductForm({
        name: '',
        price: '',
        description: '',
        ingredients: '',
        category: '',
      });

      onProductCreated();

      toast({
        title: "Producto creado",
        description: `${newProduct.name} ha sido agregado al menú.`,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el producto. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <Label htmlFor="product-name">Nombre del producto *</Label>
            <Input
              id="product-name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Ej: Arepa Reina Pepiada"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Precio (COP) *</Label>
            <Input
              id="product-price"
              type="number"
              step="100"
              min="0"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="0"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Descripción *</Label>
            <Textarea
              id="product-description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Describe el producto..."
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-ingredients">Ingredientes (separados por coma)</Label>
            <Input
              id="product-ingredients"
              value={productForm.ingredients}
              onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
              placeholder="Pollo, Aguacate, Mayonesa"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Categoría *</Label>
            <Select 
              value={productForm.category} 
              onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comida_rapida">Comidas Rápidas</SelectItem>
                <SelectItem value="especial">Especiales</SelectItem>
                <SelectItem value="extra">Extras</SelectItem>
                <SelectItem value="bebida">Bebidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Producto'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
