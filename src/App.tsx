
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/cajero" 
                element={
                  <ProtectedRoute allowedRoles={['cajero']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-2xl font-bold">Panel del Cajero - En construcción</h1>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/cocinero" 
                element={
                  <ProtectedRoute allowedRoles={['cocinero']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-2xl font-bold">Panel del Cocinero - En construcción</h1>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/mesero" 
                element={
                  <ProtectedRoute allowedRoles={['mesero']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-2xl font-bold">Panel del Mesero - En construcción</h1>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/usuario" 
                element={
                  <ProtectedRoute allowedRoles={['usuario']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
