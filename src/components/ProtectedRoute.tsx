
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const getDashboardRoute = () => {
      switch (user.role) {
        case 'admin': return '/admin';
        case 'cajero': return '/cajero';
        case 'cocinero': return '/cocinero';
        case 'mesero': return '/mesero';
        case 'usuario': return '/usuario';
        default: return '/';
      }
    };
    
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return <>{children}</>;
};
