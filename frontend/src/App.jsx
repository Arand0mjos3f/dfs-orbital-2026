import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard.jsx';
import BottomNav from './components/BottomNav.jsx';

function App() {
  return (
    <Box bg="#F8FAFC" minH="100vh">
      {/* 限制手机展示宽度并在电脑屏幕上居中 */}
      <Box px={5} maxW="md" mx="auto" position="relative" minH="100vh"> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
        
        {/* 底部导航栏挂载在底部 */}
        <BottomNav />
      </Box>
    </Box>
  );
}

export default App;