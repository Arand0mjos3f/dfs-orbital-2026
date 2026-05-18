import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard.jsx';
import Groups from './pages/Groups.jsx'; // 👈 新增这一行
import BottomNav from './components/BottomNav.jsx';

function App() {
  return (
    <Box bg="#F8FAFC" minH="100vh">
      <Box px={5} maxW="md" mx="auto" position="relative" minH="100vh"> 
        
        {/* Routing configuration: Tells application which page to display at respective URL */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} /> {/* 👈 新增这一行 */}
        </Routes>
        
        <BottomNav />
      </Box>
    </Box>
  );
}

export default App;