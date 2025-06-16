
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

type Pedido = {
  id: string;
  fecha: string;
  estado: string;
  total: number;
  usuario: {
    nombre: string;
    cedula: string;
  };
  detalles: {
    producto: {
      nombre: string;
      precio: number;
    };
    cantidad: number;
  }[];
};

type ConfiguracionFactura = {
  nombre_restaurante: string;
  nit: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  correo: string;
  logo_url: string;
  color_principal: string;
  tipografia: string;
  posicion_logo: 'izquierda' | 'centro' | 'derecha';
  mostrar_direccion: boolean;
  mostrar_nombre_cliente: boolean;
  mostrar_nit: boolean;
  mostrar_estado_pedido: boolean;
  mostrar_fecha_hora: boolean;
  mensaje_personalizado: string;
};

export const UserFacturacion = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [config, setConfig] = useState<ConfiguracionFactura | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pedidosData } = await supabase.from('pedidos').select('id,fecha,estado,total,usuario:nombre,usuario:cedula,detalles(producto(nombre,precio),cantidad)');
      const { data: configData } = await supabase.from('configuracion_factura').select('*').single();
      setPedidos(pedidosData || []);
      setConfig(configData || null);
    };
    fetchData();
  }, []);

  const generateInvoicePDF = async (pedido: Pedido) => {
    if (!config) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    const font = (config.tipografia?.toLowerCase() ?? 'helvetica');
    doc.setFont(font, 'normal');
    doc.setTextColor(config.color_principal || '#000000');

    // Logo
    if (config.logo_url) {
      const logoPosition = config.posicion_logo || 'centro';
      const imgWidth = 40;
      const imgHeight = 20;
      const x =
        logoPosition === 'izquierda' ? 20 :
        logoPosition === 'derecha' ? pageWidth - imgWidth - 20 :
        (pageWidth - imgWidth) / 2;

      try {
        const imgData = await loadImageAsBase64(config.logo_url);
        doc.addImage(imgData, 'PNG', x, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 8;
      } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
      }
    }

    doc.setFontSize(14);
    doc.text(config.nombre_restaurante || 'Mi Restaurante', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    if (config.mostrar_direccion) {
      doc.setFontSize(10);
      const dir = [config.direccion, config.ciudad, config.pais].filter(Boolean).join(', ');
      doc.text(dir, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    }

    doc.text(`Tel: ${config.telefono || ''}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text(`Correo: ${config.correo || ''}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    if (config.mostrar_nombre_cliente) {
      doc.text(`Cliente: ${pedido.usuario?.nombre || 'Anónimo'}`, 20, yPosition);
      yPosition += 6;
    }
    if (config.mostrar_nit && pedido.usuario?.cedula) {
      doc.text(`Identificación: ${pedido.usuario.cedula}`, 20, yPosition);
      yPosition += 6;
    }
    if (config.mostrar_estado_pedido) {
      doc.text(`Estado: ${pedido.estado}`, 20, yPosition);
      yPosition += 6;
    }
    if (config.mostrar_fecha_hora) {
      doc.text(`Fecha: ${format(new Date(pedido.fecha), 'dd/MM/yyyy')} - ${format(new Date(pedido.fecha), 'hh:mm a')}`, 20, yPosition);
      yPosition += 6;
    }

    yPosition += 4;
    doc.setFontSize(11);
    doc.text('Productos', 20, yPosition);
    yPosition += 6;

    pedido.detalles.forEach((detalle) => {
      doc.text(`• ${detalle.producto.nombre} (${detalle.cantidad} x $${detalle.producto.precio}) = $${detalle.cantidad * detalle.producto.precio}`, 25, yPosition);
      yPosition += 5;
    });

    yPosition += 6;
    doc.setFontSize(12);
    doc.text(`Total: $${pedido.total}`, 20, yPosition);
    yPosition += 10;

    if (config.mensaje_personalizado) {
      doc.setFontSize(10);
      doc.setTextColor('#555555');
      doc.text(config.mensaje_personalizado, pageWidth / 2, yPosition, { align: 'center' });
    }

    doc.save(`factura-${pedido.id}.pdf`);
  };

  const loadImageAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Facturación</h2>
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="border p-4 rounded-lg shadow-sm">
          <p><strong>ID:</strong> {pedido.id}</p>
          <p><strong>Fecha:</strong> {format(new Date(pedido.fecha), 'dd/MM/yyyy')}</p>
          <p><strong>Total:</strong> ${pedido.total}</p>
          <button
            onClick={() => generateInvoicePDF(pedido)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Descargar Factura
          </button>
        </div>
      ))}
    </div>
  );
};
