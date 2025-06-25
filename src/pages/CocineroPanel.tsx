
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CocineroOrders } from '@/components/cocinero/CocineroOrders';
import { CocineroPendingDelivery } from '@/components/cocinero/CocineroPendingDelivery';
import { ChefHat, Package, Clock } from 'lucide-react';

export const CocineroPanel = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel del Cocinero</h1>
          <p className="text-lg text-gray-600">Gestiona los pedidos de la cocina</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ChefHat className="h-4 w-4" />
              <span>Pedidos Activos</span>
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Listos para Entregar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span>Pedidos en Proceso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CocineroOrders />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <span>Pedidos Listos para Entregar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CocineroPendingDelivery />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CocineroPanel;
