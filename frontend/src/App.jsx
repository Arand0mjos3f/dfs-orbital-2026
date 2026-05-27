import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Login from './features/auth/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Debts from './pages/Debts';
import Profile from './pages/Profile';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'groups', element: <Groups /> },
          { path: 'groups/:groupId', element: <GroupDetail /> },
          { path: 'debts', element: <Debts /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
