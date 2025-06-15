
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Filter } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showTodayOnly: boolean;
  onTodayFilterChange: (value: boolean) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showTodayOnly,
  onTodayFilterChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h3 className="font-semibold">Filtros de Búsqueda</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar por cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Nombre del cliente..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Estado del pedido</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="recibido">Recibido</SelectItem>
              <SelectItem value="en_espera">En Espera</SelectItem>
              <SelectItem value="cocinando">Cocinando</SelectItem>
              <SelectItem value="pendiente_entrega">Pendiente Entrega</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="today-filter">Filtro de fecha</Label>
          <div className="flex gap-2">
            <Button
              variant={showTodayOnly ? "default" : "outline"}
              onClick={() => onTodayFilterChange(!showTodayOnly)}
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {showTodayOnly ? 'Todos' : 'Solo hoy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
