import { Box, Flex, VStack, Text, Center } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation(); // get the path of current page, used to highlight the menu

  // extract navigation menu into a configuration array for easier maintenance and scalability
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'groups', label: 'Groups', icon: '👥', path: '/groups' },
    // the floating camera button in the center is a special layout, so it's not included here
    { id: 'activity', label: 'Activity', icon: '⚡️', path: '/activity' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' }
  ];

  return (
    <Box 
      position="fixed" bottom={0} left={0} right={0} 
      bg="rgba(255, 255, 255, 0.85)" backdropFilter="blur(12px)" 
      borderTop="1px solid" borderColor="gray.100" pb="env(safe-area-inset-bottom)" zIndex={100}
    >
      <Flex h="70px" align="center" justify="space-around" position="relative" maxW="md" mx="auto">
        
        {/* Loop render two buttons on the left */}
        {navItems.slice(0, 2).map(item => (
          <VStack key={item.id} spacing={1} as={Link} to={item.path} color={location.pathname === item.path ? "#4F46E5" : "gray.400"}>
            <Text fontSize="xl">{item.icon}</Text>
            <Text fontSize="10px" fontWeight={location.pathname === item.path ? "bold" : "medium"}>{item.label}</Text>
          </VStack>
        ))}

        {/* floating "Scan" button in the center remains stationary */}
        <Box position="relative" top="-20px">
          <Center w="60px" h="60px" bg="#4F46E5" borderRadius="full" boxShadow="0 8px 20px rgba(79, 70, 229, 0.4)" color="white" fontSize="2xl">
            📷
          </Center>
        </Box>

        {/* Loop render two buttons on the right */}
        {navItems.slice(2, 4).map(item => (
          <VStack key={item.id} spacing={1} as={Link} to={item.path} color={location.pathname === item.path ? "#4F46E5" : "gray.400"}>
            <Text fontSize="xl">{item.icon}</Text>
            <Text fontSize="10px" fontWeight={location.pathname === item.path ? "bold" : "medium"}>{item.label}</Text>
          </VStack>
        ))}

      </Flex>
    </Box>
  );
}