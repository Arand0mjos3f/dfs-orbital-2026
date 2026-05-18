import { Box, Flex, Text, Heading, Button, Avatar, VStack, HStack, Badge } from '@chakra-ui/react';

export default function Dashboard() {
  const softShadow = "0 4px 20px rgba(0, 0, 0, 0.05)"; 

  // ==========================================
  // 1. Data Layer：this data will be obtained from backend API in the future, but for now we will hardcode it to build the UI
  // ==========================================
  const currentUser = {
    name: "Sixian",
    avatarUrl: "https://bit.ly/dan-abramov",
    totalOwed: 45.50,
    totalOwe: 12.00
  };

  const pendingBalances = [
    { id: 1, type: "owe", name: "Alice", amount: 15.00, avatarBg: "pink.400" },
    { id: 2, type: "owed", name: "Bob", amount: 12.00, avatarBg: "blue.400" },
    // 你可以随时在这里无限添加新数据，界面会自动生成对应卡片！
  ];

  const recentActivities = [
    { id: 1, title: "Grab Ride", name: "Charlie", time: "Today, 2:30 PM", amount: -8.50, avatarBg: "orange.400" },
    { id: 2, title: "Dinner Split", name: "David", time: "Yesterday, 7:00 PM", amount: 25.00, avatarBg: "purple.400" }
  ];

  // ==========================================
  // 2. View Layer：data driven interface rendering
  // ==========================================
  return (
    <Box pt={4} pb={28}> 
      
      {/* Header：dynamically render current username */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">Hello, {currentUser.name}</Heading>
        <Avatar size="sm" name={currentUser.name} src={currentUser.avatarUrl} />
      </Flex>

      {/* Total Balance Card: dynamically render total balance */}
      <Box bgGradient="linear(to-br, gray.700, gray.900)" borderRadius="24px" p={6} mb={8} boxShadow={softShadow}>
        <Text color="gray.400" fontSize="sm" fontWeight="medium" mb={4}>Total Balance</Text>
        <Flex justify="space-between" align="flex-end">
          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>You are owed</Text>
            <Text fontSize="2xl" fontWeight="black" color="#10B981">+${currentUser.totalOwed.toFixed(2)}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400" mb={1}>You owe</Text>
            <Text fontSize="xl" fontWeight="bold" color="#EF4444">-${currentUser.totalOwe.toFixed(2)}</Text>
          </Box>
        </Flex>
      </Box>

      {/* Pending Balances: use .map() to render each pending balance */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.800">Pending Balances</Heading>
        <VStack spacing={3} align="stretch">
          {pendingBalances.map((item) => (
            <Flex key={item.id} bg="#FFFFFF" p={4} borderRadius="16px" boxShadow={softShadow} align="center" justify="space-between">
              <HStack spacing={3}>
                <Avatar size="sm" name={item.name} bg={item.avatarBg} />
                <Text fontSize="sm" fontWeight="semibold" color={item.type === "owe" ? "#EF4444" : "#10B981"}>
                  {item.type === "owe" ? `You owe ${item.name}` : `${item.name} owes you`} ${item.amount.toFixed(2)}
                </Text>
              </HStack>
              <Button 
                size="sm" 
                variant={item.type === "owe" ? "outline" : "solid"} 
                borderColor={item.type === "owe" ? "#EF4444" : "transparent"} 
                color={item.type === "owe" ? "#EF4444" : "white"} 
                bg={item.type === "owe" ? "transparent" : "#10B981"}
                borderRadius="16px" 
                fontSize="xs"
                _hover={{ opacity: 0.8 }}
              >
                {item.type === "owe" ? "Mark as Paid" : "Confirm Receipt"}
              </Button>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Recent Activity list: use .map() to render each activity */}
      <Box>
        <Heading size="md" mb={4} color="gray.800">Recent Activity</Heading>
        <VStack spacing={3} align="stretch">
          {recentActivities.map((activity) => (
            <Flex key={activity.id} bg="#FFFFFF" p={4} borderRadius="16px" boxShadow={softShadow} align="center" justify="space-between">
              <HStack spacing={3}>
                <Avatar size="sm" name={activity.name} bg={activity.avatarBg} />
                <Box>
                  <Text fontSize="sm" fontWeight="bold">{activity.title}</Text>
                  <Text fontSize="xs" color="gray.400">{activity.time}</Text>
                </Box>
              </HStack>
              <Badge bg={activity.amount < 0 ? "red.50" : "green.50"} color={activity.amount < 0 ? "#EF4444" : "#10B981"} borderRadius="8px" px={2} py={1}>
                {activity.amount > 0 ? "+" : ""}{activity.amount.toFixed(2)}
              </Badge>
            </Flex>
          ))}
        </VStack>
      </Box>

    </Box>
  );
}