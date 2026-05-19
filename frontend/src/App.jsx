// src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Login from './features/auth/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';

const router = createBrowserRouter([
  {
    // Public route
    path: '/login',
    element: <Login />,
  },
  {
    // 🚨 CRITICAL FIX: Explicitly define the root path so absolute navigation works
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        // Visual layout wrapper
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'groups', element: <Groups /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
