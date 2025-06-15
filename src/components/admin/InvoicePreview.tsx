
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfiguracionFactura {
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

interface InvoicePreviewProps {
  config: ConfiguracionFactura;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ config }) => {
  const getFontFamily = () => {
    switch (config.tipografia) {
      case 'Arial': return 'font-sans';
      case 'Times New Roman': return 'font-serif';
      case 'Roboto': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getLogoAlignment = () => {
    switch (config.posicion_logo) {
      case 'izquierda': return 'justify-start';
      case 'centro': return 'justify-center';
      case 'derecha': return 'justify-end';
      default: return 'justify-start';
    }
  };

  // Datos de ejemplo para la vista previa
  const ejemploPedido = {
    id: 'baa820ab',
    cliente: 'Juan Pérez',
    estado: 'Entregado',
    fecha: '15 Jun 2024, 14:30',
    productos: [
      { nombre: 'Empanada de Pollo', cantidad: 2, precio: 5000 },
      { nombre: 'Pastel de Pollo', cantidad: 1, precio: 8000 },
      { nombre: 'Jugo de Naranja', cantidad: 1, precio: 4000 }
    ],
    total: 17000
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Previa de la Factura</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`bg-white border rounded-lg p-6 ${getFontFamily()}`}
          style={{ 
            borderColor: config.color_primario,
            boxShadow: `0 4px 6px -1px ${config.color_primario}20`
          }}
        >
          {/* Header con logo y datos de empresa */}
          <div className="mb-6">
            {config.logo_url && (
              <div className={`flex ${getLogoAlignment()} mb-4`}>
                <img 
                  src={config.logo_url} 
                  alt="Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            
            <div 
              className="text-center border-b-2 pb-4"
              style={{ borderColor: config.color_primario }}
            >
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: config.color_primario }}
              >
                {config.nombre_restaurante || 'Nombre del Restaurante'}
              </h1>
              
              {config.mostrar_direccion && config.direccion && (
                <p className="text-sm text-gray-600">{config.direccion}</p>
              )}
              
              {config.mostrar_direccion && config.ciudad_pais && (
                <p className="text-sm text-gray-600">{config.ciudad_pais}</p>
              )}
              
              <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                {config.telefono && <span>Tel: {config.telefono}</span>}
                {config.email && <span>Email: {config.email}</span>}
              </div>
              
              {config.nit && (
                <p className="text-sm text-gray-600 mt-1">NIT: {config.nit}</p>
              )}
            </div>
          </div>

          {/* Información del pedido */}
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-3"
              style={{ color: config.color_primario }}
            >
              Factura de Venta
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {config.mostrar_nombre_cliente && (
                <div>
                  <span className="font-medium">Cliente:</span>
                  <p>{ejemploPedido.cliente}</p>
                </div>
              )}
              
              {config.mostrar_id_pedido && (
                <div>
                  <span className="font-medium">Pedido:</span>
                  <p>#{ejemploPedido.id}</p>
                </div>
              )}
              
              {config.mostrar_estado_pedido && (
                <div>
                  <span className="font-medium">Estado:</span>
                  <p>{ejemploPedido.estado}</p>
                </div>
              )}
              
              {config.mostrar_fecha_hora && (
                <div>
                  <span className="font-medium">Fecha:</span>
                  <p>{ejemploPedido.fecha}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr 
                  className="border-b text-left"
                  style={{ borderColor: config.color_primario }}
                >
                  <th className="pb-2">Producto</th>
                  <th className="pb-2 text-center">Cant.</th>
                  <th className="pb-2 text-right">Precio</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ejemploPedido.productos.map((producto, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">{producto.nombre}</td>
                    <td className="py-2 text-center">{producto.cantidad}</td>
                    <td className="py-2 text-right">${producto.precio.toLocaleString()}</td>
                    <td className="py-2 text-right">
                      ${(producto.cantidad * producto.precio).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div 
              className="bg-gray-50 p-4 rounded min-w-[200px]"
              style={{ backgroundColor: `${config.color_primario}10` }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: config.color_primario }}
                >
                  ${ejemploPedido.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Mensaje personalizado */}
          {config.mensaje_personalizado && (
            <div className="text-center border-t pt-4" style={{ borderColor: config.color_primario }}>
              <p className="text-sm text-gray-600 italic">
                {config.mensaje_personalizado}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
