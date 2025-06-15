
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InvoicePreviewProps {
  config: {
    nombre_restaurante: string;
    nit: string;
    direccion: string;
    ciudad_pais: string;
    telefono: string;
    email: string;
    logo_url?: string;
    color_primario: string;
    tipografia: string;
    posicion_logo: string;
    mostrar_direccion: boolean;
    mostrar_nombre_cliente: boolean;
    mostrar_id_pedido: boolean;
    mostrar_estado_pedido: boolean;
    mostrar_fecha_hora: boolean;
    mensaje_personalizado?: string;
  };
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ config }) => {
  const logoAlignment = {
    izquierda: 'justify-start',
    centro: 'justify-center',
    derecha: 'justify-end',
  }[config.posicion_logo] || 'justify-start';

  const fontFamily = {
    'Arial': 'font-sans',
    'Times New Roman': 'font-serif',
    'Roboto': 'font-mono',
  }[config.tipografia] || 'font-sans';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa de la factura</CardTitle>
        <CardDescription>
          Así se verá la factura con la configuración actual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`max-w-md mx-auto bg-white border rounded-lg p-6 shadow-sm ${fontFamily}`}>
          {/* Header con logo */}
          <div className={`flex ${logoAlignment} mb-4`}>
            {config.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            )}
          </div>

          {/* Información de la empresa */}
          <div className="text-center mb-6">
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: config.color_primario }}
            >
              {config.nombre_restaurante || 'Nombre del Restaurante'}
            </h2>
            {config.nit && (
              <p className="text-sm text-gray-600">NIT: {config.nit}</p>
            )}
            {config.mostrar_direccion && config.direccion && (
              <p className="text-sm text-gray-600">{config.direccion}</p>
            )}
            {config.ciudad_pais && (
              <p className="text-sm text-gray-600">{config.ciudad_pais}</p>
            )}
            {config.telefono && (
              <p className="text-sm text-gray-600">Tel: {config.telefono}</p>
            )}
            {config.email && (
              <p className="text-sm text-gray-600">{config.email}</p>
            )}
          </div>

          {/* Información del pedido */}
          <div className="border-t pt-4 mb-4">
            <h3 
              className="font-semibold mb-3"
              style={{ color: config.color_primario }}
            >
              FACTURA
            </h3>
            {config.mostrar_id_pedido && (
              <p className="text-sm mb-1">
                <span className="font-medium">Pedido:</span> #baa820ab
              </p>
            )}
            {config.mostrar_fecha_hora && (
              <p className="text-sm mb-1">
                <span className="font-medium">Fecha:</span> {new Date().toLocaleDateString('es-CO')} - {new Date().toLocaleTimeString('es-CO')}
              </p>
            )}
            {config.mostrar_nombre_cliente && (
              <p className="text-sm mb-1">
                <span className="font-medium">Cliente:</span> Juan Pérez
              </p>
            )}
            {config.mostrar_estado_pedido && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium text-sm">Estado:</span>
                <Badge variant="secondary">Entregado</Badge>
              </div>
            )}
          </div>

          {/* Productos de ejemplo */}
          <div className="border-t pt-4 mb-4">
            <h4 className="font-medium mb-3">Productos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>2x Hamburguesa Clásica</span>
                <span>$24.000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>1x Papas Fritas</span>
                <span>$8.000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>2x Gaseosa</span>
                <span>$6.000</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span style={{ color: config.color_primario }}>$38.000</span>
            </div>
          </div>

          {/* Mensaje personalizado */}
          {config.mensaje_personalizado && (
            <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t">
              <p>{config.mensaje_personalizado}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
