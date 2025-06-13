
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProductFormProps {
  onProductCreated: () => void;
  userId: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated, userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    category: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB.",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten imágenes JPEG, PNG o WebP.",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      return filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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
      let imagePath = null;
      
      // Upload image if selected
      if (selectedImage) {
        imagePath = await uploadImage(selectedImage);
        if (!imagePath) {
          return; // Upload failed, error already shown
        }
      }

      const newProduct = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        description: productForm.description.trim(),
        ingredients: productForm.ingredients ? productForm.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0) : [],
        category: productForm.category,
        image_url: imagePath,
        created_by: userId,
        is_active: true,
      };

      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;

      // Reset form
      setProductForm({
        name: '',
        price: '',
        description: '',
        ingredients: '',
        category: '',
      });
      setSelectedImage(null);
      setImagePreview(null);

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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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

          <div className="space-y-2">
            <Label htmlFor="product-image">Imagen del producto</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        Haz clic para subir una imagen
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isSubmitting || isUploading}
                      />
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP hasta 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Subiendo imagen...' : 'Creando...'}
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
