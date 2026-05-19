// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import BottomNav from '../components/BottomNav';

export default function MainLayout() {
  return (
    // Center the app on desktop using align="center".
    <Flex direction="column" minH="100dvh" bg="gray.100" align="center">
      {/* Mobile Container Boundary */}
      <Flex
        direction="column"
        w="full"
        maxW="393px" // 📱 iPhone 16 exact width limit for desktop viewing
        bg="gray.50"
        minH="100dvh"
        position="relative"
        boxShadow="xl" // Gives a nice app-like shadow when viewed on a desktop monitor
      >
        {/* Main Scrollable Content Area */}
        <Box flex="1" pb="90px" overflowY="auto">
          <Outlet />
        </Box>

        {/* Persistent Bottom Navigation */}
        <Box
          position="absolute" // Changed from fixed to absolute to stay inside the 393px container
          bottom="0"
          left="0"
          right="0"
          zIndex="docked"
          bg="white"
          boxShadow="0 -4px 12px rgba(0, 0, 0, 0.05)"
          borderTopLeftRadius="24px"
          borderTopRightRadius="24px"
          pb="env(safe-area-inset-bottom)"
        >
          <BottomNav />
        </Box>
      </Flex>
    </Flex>
  );
}
