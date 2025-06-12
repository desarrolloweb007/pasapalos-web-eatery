
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const { items, updateQuantity, removeItem, total, createOrder } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  const handleFinishOrder = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para completar el pedido.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de hacer el pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    
    try {
      const order = createOrder(customerName);
      toast({
        title: "¡Pedido realizado!",
        description: `Tu pedido #${order.id} ha sido enviado a cocina.`,
      });
      setCustomerName('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu pedido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Tu Pedido
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Carrito vacío</h3>
                <p className="text-muted-foreground">
                  Agrega productos del menú para comenzar tu pedido
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 p-1">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Badge variant="secondary" className="min-w-[2rem] justify-center">
                          {item.quantity}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-medium text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Separator />

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre del cliente</Label>
                  <Input
                    id="customerName"
                    placeholder="Ingresa tu nombre"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Finish Order Button */}
                <Button
                  className="w-full"
                  onClick={handleFinishOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? 'Procesando...' : 'Finalizar Pedido'}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
