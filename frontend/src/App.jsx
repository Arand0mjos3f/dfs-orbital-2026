// src/App.jsx
import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import Login from './features/auth/Login';

// Placeholder components for routing
const Dashboard = () => <div>Dashboard View</div>;
const Groups = () => <div>Groups View</div>;
const Register = () => <div>Register View</div>;

// Configure the router with your defined boundaries
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/groups',
    element: <Groups />,
  },
]);

// Optional: Customize Chakra theme for the iOS/Mobile-first feel
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50', // Soft background for iOS feel
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '2xl', // 16px rounded corners
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'xl',
        },
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;