import { Box, Flex, Text, Heading, Avatar, AvatarGroup, VStack, HStack, Badge } from '@chakra-ui/react';

export default function Groups() {
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)"; 

  // ==========================================
  // 1.Mock data layer: this will be replaced by real API calls in the future, but for now we hardcode it to build the UI
  // ==========================================
  const mockGroups = [
    {
      id: 1,
      name: "Bali Trip 2026 🌴",
      members: ["Sixian", "Justin", "Alice"],
      totalSpent: 850.50,
      myStatus: "owe", 
      myAmount: 120.00
    },
    {
      id: 2,
      name: "NUS Roommates 🏠",
      members: ["Sixian", "Bob", "Charlie", "David"],
      totalSpent: 120.00,
      myStatus: "owed",
      myAmount: 45.00
    }
  ];

  // ==========================================
  // 2. View layer: data driven interface rendering
  // ==========================================
  return (
    <Box pt={4} pb={28}>
      
      {/* page title */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">My Groups</Heading>
        {/* cute button */}
        <Badge bg="#4F46E5" color="white" px={3} py={1} borderRadius="full" fontSize="sm" cursor="pointer">
          + New
        </Badge>
      </Flex>

      {/* group list rendering */}
      <VStack spacing={4} align="stretch">
        {mockGroups.map((group) => (
          <Box key={group.id} bg="#FFFFFF" p={5} borderRadius="20px" boxShadow={softShadow}>
            
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="md" fontWeight="bold" color="gray.800">{group.name}</Text>
              <Text fontSize="xs" color="gray.400">Total: ${group.totalSpent.toFixed(2)}</Text>
            </Flex>

            <Flex justify="space-between" align="flex-end">
              {/* group member avatars */}
              <AvatarGroup size="sm" max={3}>
                {group.members.map((member, index) => (
                  <Avatar key={index} name={member} />
                ))}
              </AvatarGroup>

              {/* my balance status in this group */}
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.400" mb={1}>
                  {group.myStatus === "owe" ? "You owe" : "You are owed"}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={group.myStatus === "owe" ? "#EF4444" : "#10B981"}>
                  {group.myStatus === "owe" ? "-" : "+"} ${group.myAmount.toFixed(2)}
                </Text>
              </Box>
            </Flex>

          </Box>
        ))}
      </VStack>

    </Box>
  );
}