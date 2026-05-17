import { Box, Flex, Text, Heading, Button, Avatar, VStack, HStack, Badge } from '@chakra-ui/react';

export default function Dashboard() {
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)"; 

  return (
    <Box pt={4} pb={28}> 
      
      {/* greeting at top */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">Hello, Justin</Heading>
        <Avatar size="sm" name="Justin" src="https://bit.ly/dan-abramov" />
      </Flex>

      {/* core balance gradient card (outer corners strictly 24px) */}
      <Box 
        bgGradient="linear(to-br, gray.700, gray.900)" 
        borderRadius="24px" 
        p={6} 
        mb={8} 
        boxShadow={softShadow}
      >
        <Text color="gray.400" fontSize="sm" fontWeight="medium" mb={4}>Total Balance</Text>
        <Flex justify="space-between" align="flex-end">
          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>You are owed</Text>
            <Text fontSize="2xl" fontWeight="black" color="#10B981">+$45.50</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400" mb={1}>You owe</Text>
            <Text fontSize="xl" fontWeight="bold" color="#EF4444">-$12.00</Text>
          </Box>
        </Flex>
      </Box>

      {/* pending settlement list */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.800">Pending Balances</Heading>
        <VStack spacing={3} align="stretch">
          
          {/* first row: you owe Alice */}
          <Flex bg="#FFFFFF" p={4} borderRadius="16px" boxShadow={softShadow} align="center" justify="space-between">
            <HStack spacing={3}>
              <Avatar size="sm" name="Alice" bg="pink.400" />
              <Text fontSize="sm" fontWeight="semibold" color="#EF4444">You owe Alice $15.00</Text>
            </HStack>
            <Button size="sm" variant="outline" borderColor="#EF4444" color="#EF4444" borderRadius="16px" fontSize="xs">
              Mark as Paid
            </Button>
          </Flex>

          {/* second row: Bob owes you money */}
          <Flex bg="#FFFFFF" p={4} borderRadius="16px" boxShadow={softShadow} align="center" justify="space-between">
            <HStack spacing={3}>
              <Avatar size="sm" name="Bob" bg="blue.400" />
              <Text fontSize="sm" fontWeight="semibold" color="#10B981">Bob owes you $12.00</Text>
            </HStack>
            <Button size="sm" bg="#10B981" color="white" borderRadius="16px" fontSize="xs" _hover={{ bg: "#059669" }}>
              Confirm Receipt
            </Button>
          </Flex>

        </VStack>
      </Box>

      {/* recent activity list */}
      <Box>
        <Heading size="md" mb={4} color="gray.800">Recent Activity</Heading>
        <VStack spacing={3} align="stretch">
          <Flex bg="#FFFFFF" p={4} borderRadius="16px" boxShadow={softShadow} align="center" justify="space-between">
            <HStack spacing={3}>
              <Avatar size="sm" name="Charlie" bg="orange.400" />
              <Box>
                <Text fontSize="sm" fontWeight="bold">Grab Ride</Text>
                <Text fontSize="xs" color="gray.400">Today, 2:30 PM</Text>
              </Box>
            </HStack>
            <Badge bg="red.50" color="#EF4444" borderRadius="8px" px={2} py={1}>-$8.50</Badge>
          </Flex>
        </VStack>
      </Box>

    </Box>
  );
}