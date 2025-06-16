
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
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchInvoiceConfig();
      
      // Setup realtime subscription for invoice configuration
      const channel = supabase
        .channel('configuracion_factura_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'configuracion_factura'
          },
          () => {
            console.log('Invoice configuration updated, refetching...');
            fetchInvoiceConfig();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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

  const fetchInvoiceConfig = async () => {
    try {
      console.log('Fetching invoice configuration...');
      const { data, error } = await supabase
        .from('configuracion_factura')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching invoice config:', error);
        setInvoiceConfig(null);
        return;
      }

      if (!data) {
        console.log('No invoice configuration found in database');
        setInvoiceConfig(null);
        return;
      }

      console.log('Invoice configuration loaded:', data);
      setInvoiceConfig(data);
    } catch (error) {
      console.error('Error fetching invoice config:', error);
      setInvoiceConfig(null);
    }
  };

  const generateInvoicePDF = async (order: Order) => {
    try {
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
      
      // Convert hex color to RGB for jsPDF
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 };
      };

      const primaryColor = hexToRgb(invoiceConfig.color_primario);
      
      let yPosition = 20;
      
      // Header with restaurant name - Receipt style
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      // Center the restaurant name
      const pageWidth = doc.internal.pageSize.width;
      const textWidth = doc.getTextWidth(invoiceConfig.nombre_restaurante);
      const xPosition = (pageWidth - textWidth) / 2;
      doc.text(invoiceConfig.nombre_restaurante, xPosition, yPosition);
      yPosition += 12;
      
      // Restaurant information (centered, receipt style)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (invoiceConfig.mostrar_direccion) {
        if (invoiceConfig.nit) {
          const nitText = `NIT: ${invoiceConfig.nit}`;
          const nitWidth = doc.getTextWidth(nitText);
          doc.text(nitText, (pageWidth - nitWidth) / 2, yPosition);
          yPosition += 5;
        }
        
        if (invoiceConfig.direccion) {
          const addressWidth = doc.getTextWidth(invoiceConfig.direccion);
          doc.text(invoiceConfig.direccion, (pageWidth - addressWidth) / 2, yPosition);
          yPosition += 5;
        }
        
        if (invoiceConfig.ciudad_pais) {
          const cityWidth = doc.getTextWidth(invoiceConfig.ciudad_pais);
          doc.text(invoiceConfig.ciudad_pais, (pageWidth - cityWidth) / 2, yPosition);
          yPosition += 5;
        }
        
        if (invoiceConfig.telefono) {
          const phoneText = `Tel: ${invoiceConfig.telefono}`;
          const phoneWidth = doc.getTextWidth(phoneText);
          doc.text(phoneText, (pageWidth - phoneWidth) / 2, yPosition);
          yPosition += 5;
        }
        
        if (invoiceConfig.email) {
          const emailWidth = doc.getTextWidth(invoiceConfig.email);
          doc.text(invoiceConfig.email, (pageWidth - emailWidth) / 2, yPosition);
          yPosition += 5;
        }
      }
      
      yPosition += 10;
      
      // Separator line
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Invoice title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      const invoiceTitle = 'FACTURA ELECTRÓNICA';
      const titleWidth = doc.getTextWidth(invoiceTitle);
      doc.text(invoiceTitle, (pageWidth - titleWidth) / 2, yPosition);
      yPosition += 10;
      
      // Order details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (invoiceConfig.mostrar_id_pedido) {
        doc.text(`Pedido: #${order.id.substring(0, 8)}`, 20, yPosition);
        yPosition += 4;
      }
      
      if (invoiceConfig.mostrar_nombre_cliente) {
        doc.text(`Cliente: ${order.customer_name}`, 20, yPosition);
        yPosition += 4;
      }
      
      if (invoiceConfig.mostrar_fecha_hora) {
        const date = new Date(order.created_at);
        doc.text(`Fecha: ${format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es })}`, 20, yPosition);
        yPosition += 4;
      }
      
      if (invoiceConfig.mostrar_estado_pedido) {
        doc.text(`Estado: ${order.status}`, 20, yPosition);
        yPosition += 4;
      }
      
      yPosition += 6;
      
      // Another separator line
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Products header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCTOS', 20, yPosition);
      yPosition += 6;
      
      // Products table headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Cant.', 20, yPosition);
      doc.text('Producto', 35, yPosition);
      doc.text('P.Unit', 130, yPosition);
      doc.text('Total', 160, yPosition);
      yPosition += 4;
      
      // Line under headers
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 6;
      
      // Products list
      order.order_items.forEach(item => {
        doc.text(item.quantity.toString(), 20, yPosition);
        
        // Truncate product name if too long
        let productName = item.products.name;
        if (productName.length > 35) {
          productName = productName.substring(0, 32) + '...';
        }
        doc.text(productName, 35, yPosition);
        
        doc.text(`$${item.unit_price.toFixed(0)}`, 130, yPosition);
        doc.text(`$${item.total_price.toFixed(0)}`, 160, yPosition);
        yPosition += 5;
      });
      
      yPosition += 4;
      
      // Total separator line
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Total
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      const totalText = `TOTAL: $${order.total_price.toFixed(0)}`;
      const totalWidth = doc.getTextWidth(totalText);
      doc.text(totalText, (pageWidth - totalWidth) / 2, yPosition);
      yPosition += 15;
      
      // Custom message
      if (invoiceConfig.mensaje_personalizado) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const messageWidth = doc.getTextWidth(invoiceConfig.mensaje_personalizado);
        doc.text(invoiceConfig.mensaje_personalizado, (pageWidth - messageWidth) / 2, yPosition);
      }
      
      // Save PDF
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
          
          {!invoiceConfig && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ No se encontró configuración de facturación. Las facturas podrían no generarse correctamente.
              </p>
            </div>
          )}
          
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
                    disabled={!invoiceConfig}
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
