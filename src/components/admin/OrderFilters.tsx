
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Filter } from 'lucide-react';

interface OrderFiltersProps {
  onSearchChange: (search: string) => void;
  onTodayFilter: () => void;
  onMonthFilter: (month: number) => void;
  onResetFilters: () => void;
  activeFilters: {
    search: string;
    isToday: boolean;
    month: number | null;
  };
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  onSearchChange,
  onTodayFilter,
  onMonthFilter,
  onResetFilters,
  activeFilters
}) => {
  const [searchValue, setSearchValue] = useState(activeFilters.search);

  const months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange(value);
  };

  const hasActiveFilters = activeFilters.search || activeFilters.isToday || activeFilters.month !== null;

  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filtros de Pedidos</span>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, ID..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro de hoy */}
        <Button
          variant={activeFilters.isToday ? "default" : "outline"}
          onClick={onTodayFilter}
          className="justify-start"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Pedidos de hoy
        </Button>

        {/* Filtro por mes */}
        <Select
          value={activeFilters.month?.toString() || ""}
          onValueChange={(value) => onMonthFilter(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Badges de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.search && (
            <Badge variant="secondary">
              Búsqueda: "{activeFilters.search}"
            </Badge>
          )}
          {activeFilters.isToday && (
            <Badge variant="secondary">
              Pedidos de hoy
            </Badge>
          )}
          {activeFilters.month !== null && (
            <Badge variant="secondary">
              {months[activeFilters.month]?.label} {new Date().getFullYear()}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
