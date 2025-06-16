
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut } from 'lucide-react';

// Import tab components
import { UserResumen } from '@/components/user/UserResumen';
import { UserProductos } from '@/components/user/UserProductos';
import { UserDestacados } from '@/components/user/UserDestacados';
import { UserPedidos } from '@/components/user/UserPedidos';
import { UserUsuarios } from '@/components/user/UserUsuarios';
import { UserFacturacion } from '@/components/user/UserFacturacion';

export const UserDashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('resumen');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header Navigation - Exactly like the image */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-800">Casa de los Pasapalos</span>
            </div>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-orange-600 font-medium"
              >
                Inicio
              </button>
              <button 
                onClick={() => navigate('/menu')}
                className="text-gray-700 hover:text-orange-600 font-medium"
              >
                Menú
              </button>
              <span className="text-orange-600 font-medium">Mi Panel</span>
            </div>

            {/* Right Section - User greeting and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Hola, {userProfile.full_name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Usuario</h1>
          <p className="text-gray-600">Bienvenido, {userProfile.full_name}</p>
        </div>

        {/* Tabs Navigation - Exactly like the image */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 rounded-lg p-1 mb-8">
            <TabsTrigger 
              value="resumen" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="productos" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Productos
            </TabsTrigger>
            <TabsTrigger 
              value="destacados" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Destacados
            </TabsTrigger>
            <TabsTrigger 
              value="pedidos" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Pedidos
            </TabsTrigger>
            <TabsTrigger 
              value="usuarios" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Usuarios
            </TabsTrigger>
            <TabsTrigger 
              value="facturacion" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 text-gray-600 font-medium"
            >
              Facturación
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="resumen" className="mt-6">
            <UserResumen />
          </TabsContent>

          <TabsContent value="productos" className="mt-6">
            <UserProductos />
          </TabsContent>

          <TabsContent value="destacados" className="mt-6">
            <UserDestacados />
          </TabsContent>

          <TabsContent value="pedidos" className="mt-6">
            <UserPedidos />
          </TabsContent>

          <TabsContent value="usuarios" className="mt-6">
            <UserUsuarios />
          </TabsContent>

          <TabsContent value="facturacion" className="mt-6">
            <UserFacturacion />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
