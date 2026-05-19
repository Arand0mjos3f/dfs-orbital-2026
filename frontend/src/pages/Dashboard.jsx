// src/pages/Dashboard.jsx
import { Box, Flex, Text, Heading, Avatar, VStack } from '@chakra-ui/react';
import { useAuthStore } from '../store/useAuthStore';

// 🏗️ ARCHITECTURAL TWEAK: A reusable wrapper keeps the UI uniform
// and cleans up the JSX in your main component.
const WidgetContainer = ({ title, children, bg = 'white', color = 'gray.800' }) => {
  const softShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';

  return (
    <Box>
      {title && (
        <Heading size="md" mb={4} color={color}>
          {title}
        </Heading>
      )}
      <Box bg={bg} borderRadius="16px" p={4} boxShadow={softShadow} minH="100px">
        {children}
      </Box>
    </Box>
  );
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <Box pt={4} pb={28} px={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">
          Hello, {user?.username || 'Guest'}
        </Heading>
        <Avatar size="sm" name={user?.username} src={user?.avatarUrl} />
      </Flex>

      <VStack spacing={6} align="stretch">
        {/* Placeholder for Teammate's Balance Summary */}
        <WidgetContainer bg="gray.800" color="white">
          <Text color="gray.400" fontSize="sm" textAlign="center" pt={4}>
            [ Teammate's Balance Summary Component ]
          </Text>
        </WidgetContainer>

        {/* Placeholder for Teammate's Pending Balances */}
        <WidgetContainer title="Pending">
          <Text color="gray.400" fontSize="sm" textAlign="center" pt={4}>
            [ Teammate's Pending Balances List ]
          </Text>
        </WidgetContainer>

        {/* Placeholder for Teammate's Activity */}
        <WidgetContainer title="Recent Activity">
          <Text color="gray.400" fontSize="sm" textAlign="center" pt={4}>
            [ Teammate's Activity List ]
          </Text>
        </WidgetContainer>
      </VStack>
    </Box>
  );
}
