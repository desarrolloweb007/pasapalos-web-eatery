
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { InvoiceConfiguration } from '@/components/admin/InvoiceConfiguration';

const InvoicingConfiguration = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración de Facturación
            </h1>
            <p className="text-gray-600 mt-2">
              Personaliza el diseño y contenido de las facturas electrónicas
            </p>
          </div>
          
          <InvoiceConfiguration />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InvoicingConfiguration;
