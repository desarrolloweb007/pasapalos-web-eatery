
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Menu, ShoppingCart, User, LogOut } from 'lucide-react';
import { CartDrawer } from './CartDrawer';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'cajero': return '/cajero';
      case 'cocinero': return '/cocinero';
      case 'mesero': return '/mesero';
      case 'usuario': return '/usuario';
      default: return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-yellow flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">C</span>
          </div>
          <span className="hidden font-bold text-xl text-primary sm:inline-block">
            Casa de los Pasapalos
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link to="/menu" className="text-sm font-medium hover:text-primary transition-colors">
            Menú
          </Link>
          {isAuthenticated && (
            <Link to={getDashboardRoute()} className="text-sm font-medium hover:text-primary transition-colors">
              Mi Panel
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Hola, {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="hidden md:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/menu"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Menú
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardRoute()}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Panel
                    </Link>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Conectado como: {user?.name}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
};
