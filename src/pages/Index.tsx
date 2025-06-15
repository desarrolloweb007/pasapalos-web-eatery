
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Clock, Utensils, Heart } from 'lucide-react';
import { FeaturedProducts } from '@/components/FeaturedProducts';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-yellow">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Casa de los Pasapalos
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
              Los mejores sabores venezolanos en cada bocado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                <Link to="/menu">Ver Menú Completo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                <Link to="#featured">Productos Destacados</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preparación Rápida</h3>
              <p className="text-muted-foreground">
                Tus platos favoritos listos en minutos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Utensils className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ingredientes Frescos</h3>
              <p className="text-muted-foreground">
                Solo utilizamos los mejores ingredientes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sabor Auténtico</h3>
              <p className="text-muted-foreground">
                Recetas tradicionales venezolanas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Productos Destacados
            </h2>
            <p className="text-xl text-muted-foreground">
              Lo más popular de nuestro menú
            </p>
          </div>

          <FeaturedProducts />

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/menu">Ver Menú Completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para ordenar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explora nuestro menú completo y haz tu pedido ahora
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link to="/menu">Hacer Pedido</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
