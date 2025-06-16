import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface Order {
  id: string;
  customer_name: string;
  total_price: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      price: number;
    };
  }[];
}

interface InvoiceConfig {
  id: string;
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
  mensaje_personalizado?: string;
  mostrar_direccion: boolean;
  mostrar_id_pedido: boolean;
  mostrar_nombre_cliente: boolean;
  mostrar_estado_pedido: boolean;
  mostrar_fecha_hora: boolean;
}

export const UserFacturacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          total_price,
          status,
          created_at,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              price
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceConfig = async (): Promise<InvoiceConfig | null> => {
    try {
      console.log('Fetching invoice configuration...');
      const { data, error } = await supabase
        .from('configuracion_factura')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching invoice config:', error);
        return null;
      }

      if (!data) {
        console.log('No invoice configuration found in database');
        return null;
      }

      console.log('Invoice configuration loaded:', data);
      return data;
    } catch (error) {
      console.error('Error fetching invoice config:', error);
      return null;
    }
  };

  const generateInvoicePDF = async (order: Order) => {
    try {
      // Obtener configuración de factura
      const invoiceConfig = await fetchInvoiceConfig();
      
      if (!invoiceConfig) {
        toast({
          title: "Error de configuración",
          description: "No se encontró la configuración de facturación. Contacta al administrador.",
          variant: "destructive",
        });
        return;
      }

      console.log('Generating PDF with config:', invoiceConfig);

      const doc = new jsPDF();
      
      // Configurar fuente según configuración
      doc.setFont('helvetica');
      
      let yPosition = 20;
      
      // Título con nombre del restaurante
      doc.setFontSize(20);
      doc.setTextColor(invoiceConfig.color_primario);
      doc.text(invoiceConfig.nombre_restaurante, 20, yPosition);
      yPosition += 15;
      
      // Datos del restaurante (solo si mostrar_direccion está habilitado)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      if (invoiceConfig.mostrar_direccion) {
        if (invoiceConfig.nit) {
          doc.text(`NIT: ${invoiceConfig.nit}`, 20, yPosition);
          yPosition += 5;
        }
        if (invoiceConfig.direccion) {
          doc.text(`Dirección: ${invoiceConfig.direccion}`, 20, yPosition);
          yPosition += 5;
        }
        if (invoiceConfig.ciudad_pais) {
          doc.text(`${invoiceConfig.ciudad_pais}`, 20, yPosition);
          yPosition += 5;
        }
        if (invoiceConfig.telefono) {
          doc.text(`Tel: ${invoiceConfig.telefono}`, 20, yPosition);
          yPosition += 5;
        }
        if (invoiceConfig.email) {
          doc.text(`Email: ${invoiceConfig.email}`, 20, yPosition);
          yPosition += 5;
        }
      }
      
      yPosition += 10;
      
      // Título de factura
      doc.setFontSize(14);
      doc.setTextColor(invoiceConfig.color_primario);
      doc.text('FACTURA ELECTRÓNICA', 20, yPosition);
      yPosition += 10;
      
      // Datos del pedido
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      if (invoiceConfig.mostrar_id_pedido) {
        doc.text(`ID Pedido: #${order.id.substring(0, 8)}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_nombre_cliente) {
        doc.text(`Cliente: ${order.customer_name}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_fecha_hora) {
        const date = new Date(order.created_at);
        doc.text(`Fecha: ${format(date, 'dd/MM/yyyy', { locale: es })}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Hora: ${format(date, 'HH:mm:ss', { locale: es })}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (invoiceConfig.mostrar_estado_pedido) {
        doc.text(`Estado: ${order.status}`, 20, yPosition);
        yPosition += 5;
      }
      
      yPosition += 10;
      
      // Tabla de productos
      doc.setFontSize(12);
      doc.setTextColor(invoiceConfig.color_primario);
      doc.text('PRODUCTOS:', 20, yPosition);
      yPosition += 8;
      
      // Headers de tabla
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Producto', 20, yPosition);
      doc.text('Cant.', 100, yPosition);
      doc.text('Precio Unit.', 130, yPosition);
      doc.text('Subtotal', 170, yPosition);
      yPosition += 3;
      
      // Línea divisoria
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Items del pedido
      order.order_items.forEach(item => {
        doc.text(item.products.name, 20, yPosition);
        doc.text(item.quantity.toString(), 100, yPosition);
        doc.text(`$${item.unit_price.toFixed(2)}`, 130, yPosition);
        doc.text(`$${item.total_price.toFixed(2)}`, 170, yPosition);
        yPosition += 5;
      });
      
      // Línea divisoria
      yPosition += 2;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      // Total
      doc.setFontSize(12);
      doc.setTextColor(invoiceConfig.color_primario);
      doc.text(`TOTAL: $${order.total_price.toFixed(2)}`, 130, yPosition);
      yPosition += 20;
      
      // Mensaje personalizado
      if (invoiceConfig.mensaje_personalizado) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(invoiceConfig.mensaje_personalizado, 20, yPosition);
      }
      
      // Guardar PDF
      const fileName = `factura-${order.id.substring(0, 8)}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "¡Factura generada!",
        description: `La factura ${fileName} se ha descargado correctamente`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Error al generar la factura. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <span>Facturación Electrónica</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Descarga las facturas electrónicas de todos tus pedidos. 
            Las facturas incluyen toda la información configurada por el restaurante.
          </p>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay pedidos para facturar</p>
              <p className="text-sm">Los pedidos que realices aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold text-gray-900">Pedido #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          Cliente: {order.customer_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        ${order.total_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        {order.order_items.length} productos - Estado: {order.status}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateInvoicePDF(order)}
                    variant="outline"
                    className="ml-4 border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Factura
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
