
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-6 p-8 max-w-md mx-auto">
        {/* Logo y Título */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-yellow flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">Casa de los Pasapalos</h1>
        </div>

        {/* Mensaje de Error */}
        <div className="space-y-3">
          <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
          <p className="text-xl text-muted-foreground">¡Oops! Página no encontrada</p>
          <p className="text-sm text-muted-foreground/80">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Botón para volver */}
        <Button asChild size="lg" className="mt-6">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
