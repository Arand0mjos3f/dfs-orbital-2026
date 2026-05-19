import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      {/* BrowserRouter is GONE! App.jsx handles all routing now. */}
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
