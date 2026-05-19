// src/features/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProtectedRoute() {
  // We only subscribe to the boolean to prevent unnecessary re-renders
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // replace=true prevents the user from clicking the browser "back" button
    // to return to the protected page after being kicked out.
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}
