
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, Award, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-warm">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground">
            Casa de los Pasapalos
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Auténticos sabores venezolanos que despiertan tus sentidos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/menu">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Menú
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/auth">
                Crear Cuenta
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <div className="container mx-auto px-4">
        <FeaturedProducts />
      </div>

      {/* Features Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary">¿Por qué elegirnos?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Más que comida, ofrecemos una experiencia gastronómica que conecta con tus raíces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-yellow flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rápido y Fresco</h3>
              <p className="text-muted-foreground">
                Ingredientes frescos preparados al momento para garantizar la mejor calidad
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-yellow flex items-center justify-center">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sabor Auténtico</h3>
              <p className="text-muted-foreground">
                Recetas tradicionales venezolanas transmitidas de generación en generación
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-yellow flex items-center justify-center">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
              <p className="text-muted-foreground">
                Un equipo comprometido con brindarte la mejor experiencia gastronómica
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-foreground">
            ¿Listo para disfrutar?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Descubre nuestro menú completo y haz tu pedido ahora
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/menu">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explorar Menú
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-yellow flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-bold text-lg text-primary">Casa de los Pasapalos</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Casa de los Pasapalos. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
