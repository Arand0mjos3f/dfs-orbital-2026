import { Box, Flex, VStack, Text, IconButton, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function BottomNav() {
  return (
    <Box 
      position="fixed" 
      bottom={0} 
      left={0} 
      right={0} 
      bg="rgba(255, 255, 255, 0.85)" 
      backdropFilter="blur(12px)" // 毛玻璃效果 (Frosted-glass)
      borderTop="1px solid"
      borderColor="gray.100"
      pb="env(safe-area-inset-bottom)" // 适配 iPhone 底部小黑条
      zIndex={100}
    >
      <Flex h="70px" align="center" justify="space-around" position="relative" maxW="md" mx="auto">
        
        {/* Home */}
        <VStack spacing={1} as={Link} to="/" color="#4F46E5">
          <Text fontSize="xl">🏠</Text>
          <Text fontSize="10px" fontWeight="bold">Home</Text>
        </VStack>

        {/* Groups */}
        <VStack spacing={1} color="gray.400">
          <Text fontSize="xl">👥</Text>
          <Text fontSize="10px" fontWeight="medium">Groups</Text>
        </VStack>

        {/* Center Floating Action Button (FAB) - Scan */}
        <Box position="relative" top="-20px">
          <Center 
            w="60px" 
            h="60px" 
            bg="#4F46E5" 
            borderRadius="full" 
            boxShadow="0 8px 20px rgba(79, 70, 229, 0.4)"
            color="white"
            fontSize="2xl"
            _hover={{ bg: "#4338CA", transform: "scale(1.05)" }}
            transition="all 0.2s"
          >
            📷
          </Center>
        </Box>

        {/* Profile */}
        <VStack spacing={1} color="gray.400">
          <Text fontSize="xl">👤</Text>
          <Text fontSize="10px" fontWeight="medium">Profile</Text>
        </VStack>
      </Flex>
    </Box>
  );
}