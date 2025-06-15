
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Upload } from 'lucide-react';

const schema = z.object({
  nombre_restaurante: z.string().min(1, 'El nombre del restaurante es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad_pais: z.string().min(1, 'La ciudad y país son requeridos'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido'),
  color_primario: z.string(),
  tipografia: z.enum(['Arial', 'Times New Roman', 'Roboto']),
  posicion_logo: z.enum(['izquierda', 'centro', 'derecha']),
  mostrar_direccion: z.boolean(),
  mostrar_nombre_cliente: z.boolean(),
  mostrar_id_pedido: z.boolean(),
  mostrar_estado_pedido: z.boolean(),
  mostrar_fecha_hora: z.boolean(),
  mensaje_personalizado: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface InvoiceConfigurationProps {
  onConfigChange: (config: any) => void;
}

export const InvoiceConfiguration: React.FC<InvoiceConfigurationProps> = ({ onConfigChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [existingConfigId, setExistingConfigId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_restaurante: '',
      nit: '',
      direccion: '',
      ciudad_pais: '',
      telefono: '',
      email: '',
      color_primario: '#3B82F6',
      tipografia: 'Arial',
      posicion_logo: 'izquierda',
      mostrar_direccion: true,
      mostrar_nombre_cliente: true,
      mostrar_id_pedido: true,
      mostrar_estado_pedido: true,
      mostrar_fecha_hora: true,
      mensaje_personalizado: 'Gracias por su compra',
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    loadConfiguration();
  }, [user?.id]);

  useEffect(() => {
    onConfigChange({
      ...watchedValues,
      logo_url: logoUrl,
    });
  }, [watchedValues, logoUrl, onConfigChange]);

  const loadConfiguration = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracion_factura')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading configuration:', error);
        return;
      }

      if (data) {
        setExistingConfigId(data.id);
        form.reset({
          nombre_restaurante: data.nombre_restaurante,
          nit: data.nit,
          direccion: data.direccion,
          ciudad_pais: data.ciudad_pais,
          telefono: data.telefono,
          email: data.email,
          color_primario: data.color_primario,
          tipografia: data.tipografia as 'Arial' | 'Times New Roman' | 'Roboto',
          posicion_logo: data.posicion_logo as 'izquierda' | 'centro' | 'derecha',
          mostrar_direccion: data.mostrar_direccion,
          mostrar_nombre_cliente: data.mostrar_nombre_cliente,
          mostrar_id_pedido: data.mostrar_id_pedido,
          mostrar_estado_pedido: data.mostrar_estado_pedido,
          mostrar_fecha_hora: data.mostrar_fecha_hora,
          mensaje_personalizado: data.mensaje_personalizado || '',
        });
        setLogoUrl(data.logo_url || '');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PNG, JPG o WebP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoice-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('invoice-logos')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);

      toast({
        title: "Éxito",
        description: "Logo subido correctamente",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Error al subir el logo",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const configData = {
        user_id: user.id,
        ...data,
        logo_url: logoUrl,
      };

      let error;

      if (existingConfigId) {
        // Actualizar configuración existente
        const { error: updateError } = await supabase
          .from('configuracion_factura')
          .update(configData)
          .eq('id', existingConfigId);
        error = updateError;
      } else {
        // Crear nueva configuración
        const { error: insertError } = await supabase
          .from('configuracion_factura')
          .insert(configData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente",
      });

      // Recargar configuración para obtener el ID si es nueva
      if (!existingConfigId) {
        await loadConfiguration();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Facturación</CardTitle>
        <CardDescription>
          Personaliza el diseño y contenido de las facturas electrónicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Datos de la empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datos de la empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre_restaurante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del restaurante</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIT</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ciudad_pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad y país</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Logo upload */}
              <div className="space-y-2">
                <Label>Logo del restaurante</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir logo
                  </Button>
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-12 w-12 object-contain border rounded"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, WebP hasta 5MB
                </p>
              </div>
            </div>

            {/* Configuración visual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuración visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="color_primario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color primario</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipografia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipografía</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="posicion_logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición del logo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="izquierda">Izquierda</SelectItem>
                          <SelectItem value="centro">Centro</SelectItem>
                          <SelectItem value="derecha">Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Elementos a mostrar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Elementos a mostrar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mostrar_direccion"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar dirección</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mostrar_nombre_cliente"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar nombre del cliente</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mostrar_id_pedido"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar ID del pedido</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mostrar_estado_pedido"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar estado del pedido</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mostrar_fecha_hora"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar fecha y hora</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Mensaje personalizado */}
            <FormField
              control={form.control}
              name="mensaje_personalizado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje personalizado</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Gracias por su compra"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
