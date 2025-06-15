
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvoicePreview } from './InvoicePreview';

interface ConfiguracionFactura {
  id?: string;
  nombre_restaurante: string;
  nit: string;
  direccion: string;
  ciudad_pais: string;
  telefono: string;
  email: string;
  logo_url?: string;
  color_primario: string;
  tipografia: 'Arial' | 'Times New Roman' | 'Roboto';
  posicion_logo: 'izquierda' | 'centro' | 'derecha';
  mostrar_direccion: boolean;
  mostrar_nombre_cliente: boolean;
  mostrar_id_pedido: boolean;
  mostrar_estado_pedido: boolean;
  mostrar_fecha_hora: boolean;
  mensaje_personalizado: string;
}

const defaultConfig: ConfiguracionFactura = {
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
  mensaje_personalizado: 'Gracias por su compra'
};

export const InvoiceConfiguration: React.FC = () => {
  const [config, setConfig] = useState<ConfiguracionFactura>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_factura')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PNG, JPG y WebP.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no puede ser mayor a 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoice-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('invoice-logos')
        .getPublicUrl(fileName);

      setConfig(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const configData = {
        ...config,
        user_id: user.id
      };

      if (config.id) {
        const { error } = await supabase
          .from('configuracion_factura')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('configuracion_factura')
          .insert([configData])
          .select()
          .single();
        
        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de facturación se ha guardado correctamente.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario de configuración */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Empresa</CardTitle>
            <CardDescription>
              Configura la información básica de tu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del restaurante</Label>
              <Input
                id="nombre"
                value={config.nombre_restaurante}
                onChange={(e) => setConfig(prev => ({ ...prev, nombre_restaurante: e.target.value }))}
                placeholder="Casa de los Pasapalos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nit">NIT o identificación tributaria</Label>
              <Input
                id="nit"
                value={config.nit}
                onChange={(e) => setConfig(prev => ({ ...prev, nit: e.target.value }))}
                placeholder="123456789-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección del restaurante</Label>
              <Input
                id="direccion"
                value={config.direccion}
                onChange={(e) => setConfig(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Calle 123 #45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad y país</Label>
              <Input
                id="ciudad"
                value={config.ciudad_pais}
                onChange={(e) => setConfig(prev => ({ ...prev, ciudad_pais: e.target.value }))}
                placeholder="Bogotá, Colombia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={config.telefono}
                onChange={(e) => setConfig(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+57 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contacto@casadelospa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo del restaurante</Label>
              <div className="flex items-center gap-4">
                <input
                  id="logo"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Subir Logo
                </Button>
                {config.logo_url && (
                  <img 
                    src={config.logo_url} 
                    alt="Logo" 
                    className="h-10 w-10 object-contain rounded border"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP hasta 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración Visual</CardTitle>
            <CardDescription>
              Personaliza el diseño de tus facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color primario</Label>
              <div className="flex items-center gap-4">
                <input
                  id="color"
                  type="color"
                  value={config.color_primario}
                  onChange={(e) => setConfig(prev => ({ ...prev, color_primario: e.target.value }))}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{config.color_primario}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipografia">Tipografía</Label>
              <Select 
                value={config.tipografia} 
                onValueChange={(value: 'Arial' | 'Times New Roman' | 'Roboto') => 
                  setConfig(prev => ({ ...prev, tipografia: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="posicion">Posición del logo</Label>
              <Select 
                value={config.posicion_logo} 
                onValueChange={(value: 'izquierda' | 'centro' | 'derecha') => 
                  setConfig(prev => ({ ...prev, posicion_logo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="izquierda">Izquierda</SelectItem>
                  <SelectItem value="centro">Centro</SelectItem>
                  <SelectItem value="derecha">Derecha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Elementos a mostrar</Label>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="direccion"
                  checked={config.mostrar_direccion}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mostrar_direccion: checked }))}
                />
                <Label htmlFor="direccion">Dirección del restaurante</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="cliente"
                  checked={config.mostrar_nombre_cliente}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mostrar_nombre_cliente: checked }))}
                />
                <Label htmlFor="cliente">Nombre del cliente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="id-pedido"
                  checked={config.mostrar_id_pedido}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mostrar_id_pedido: checked }))}
                />
                <Label htmlFor="id-pedido">ID del pedido</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={config.mostrar_estado_pedido}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mostrar_estado_pedido: checked }))}
                />
                <Label htmlFor="estado">Estado del pedido</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="fecha"
                  checked={config.mostrar_fecha_hora}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mostrar_fecha_hora: checked }))}
                />
                <Label htmlFor="fecha">Fecha y hora del pedido</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje personalizado final</Label>
              <Textarea
                id="mensaje"
                value={config.mensaje_personalizado}
                onChange={(e) => setConfig(prev => ({ ...prev, mensaje_personalizado: e.target.value }))}
                placeholder="Gracias por su compra"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>

      {/* Vista previa */}
      <div className="lg:sticky lg:top-6">
        <InvoicePreview config={config} />
      </div>
    </div>
  );
};
