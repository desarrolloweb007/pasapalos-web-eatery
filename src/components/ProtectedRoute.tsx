
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
  const { user, userProfile, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role_name!)) {
    // Redirect to appropriate dashboard based on user role
    const getDashboardRoute = () => {
      switch (userProfile.role_name) {
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
