
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Filter } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showTodayOnly: boolean;
  onToggleTodayOnly: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showTodayOnly,
  onToggleTodayOnly,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre de cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Button
        variant={showTodayOnly ? "default" : "outline"}
        onClick={onToggleTodayOnly}
        className="whitespace-nowrap"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Pedidos de hoy
      </Button>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="recibido">Recibido</SelectItem>
          <SelectItem value="en_espera">En espera</SelectItem>
          <SelectItem value="cocinando">Cocinando</SelectItem>
          <SelectItem value="pendiente_entrega">Pendiente entrega</SelectItem>
          <SelectItem value="entregado">Entregado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
