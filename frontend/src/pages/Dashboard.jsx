import React, { useState } from 'react';
import { 
  Box, Flex, VStack, HStack, Text, Heading, Avatar, Button, IconButton, Badge 
} from '@chakra-ui/react';
import { Home, Users, User, ScanLine, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // [DYNAMIC DATA] 模拟从后端 Fetch 过来的 JSON 数据
  const [currentUser] = useState({
    id: 'u1',
    firstName: 'Alex',
    avatarUrl: 'https://bit.ly/dan-abramov',
    totalReceivables: 45.50,
    totalPayables: 12.00,
    currency: '$'
  });

  const [pendingDebts] = useState([
    {
      id: 'd1',
      debtorId: 'u1', // 当前用户欠钱
      creditorId: 'u2',
      creditorName: 'Sarah',
      creditorAvatar: 'https://bit.ly/sage-adebayo',
      amount: 15.00,
    },
    {
      id: 'd2',
      debtorId: 'u3', // 别人欠当前用户
      debtorName: 'Michael',
      debtorAvatar: 'https://bit.ly/kent-c-dodds',
      creditorId: 'u1',
      amount: 12.00,
    }
  ]);

  const [recentTransactions] = useState([
    {
      id: 't1',
      description: 'Din Tai Fung Dinner',
      timestamp: 'Today, 8:30 PM',
      amount: 25.50,
      type: 'paid', // 用户付了钱 (负数)
    },
    {
      id: 't2',
      description: 'Grab to Campus',
      timestamp: 'Yesterday, 10:15 AM',
      amount: 8.00,
      type: 'received', // 用户收到了钱 (正数)
    }
  ]);

  // 处理扫描按钮点击
  const handleScanReceipt = () => {
    navigate('/assign');
  };

  // 处理还款或确认收款
  const handleAction = (debtId, actionType) => {
    console.log(`Processing ${actionType} for debt ${debtId}`);
    // 未来这里将调用 Axios: axios.post(`/api/settlement/${debtId}`)
  };

  return (
    <Box minH="100vh" bg="#F8FAFC" pb="100px" fontFamily="Inter, sans-serif">
      
      {/* 1. Header */}
      <Flex justify="space-between" align="center" p={6} pt={8}>
        <VStack align="start" spacing={0}>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">Good morning,</Text>
          <Heading as="h1" size="lg" color="gray.800" fontWeight="bold">
            Hello, {currentUser.firstName}
          </Heading>
        </VStack>
        <Avatar size="md" src={currentUser.avatarUrl} />
      </Flex>

      <Box px={6}>
        {/* 2. Total Balance Card */}
        <Box 
          bgGradient="linear(to-br, gray.800, gray.900)" 
          borderRadius="24px" 
          p={6} 
          mb={8}
          boxShadow="0 10px 30px rgba(0,0,0,0.1)"
        >
          <Text color="gray.400" fontSize="sm" mb={4}>Your Balances</Text>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">You are owed</Text>
              <Text color="#10B981" fontSize="2xl" fontWeight="bold">
                {currentUser.currency}{currentUser.totalReceivables.toFixed(2)}
              </Text>
            </VStack>
            <Box w="1px" h="40px" bg="gray.700" />
            <VStack align="start" spacing={1}>
              <Text color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">You owe</Text>
              <Text color="#EF4444" fontSize="2xl" fontWeight="bold">
                {currentUser.currency}{currentUser.totalPayables.toFixed(2)}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* 3. Pending Balances Section */}
        <Box mb={8}>
          <Heading as="h2" size="md" color="gray.800" mb={4} fontWeight="semibold">
            Pending Balances
          </Heading>
          <VStack spacing={3} align="stretch">
            {pendingDebts.map((debt) => {
              const isOwedByMe = debt.debtorId === currentUser.id;

              return (
                <Flex 
                  key={debt.id} 
                  bg="#FFFFFF" 
                  p={4} 
                  borderRadius="16px" 
                  align="center" 
                  justify="space-between"
                  boxShadow="0 4px 12px rgba(0,0,0,0.05)"
                >
                  <HStack spacing={3}>
                    <Avatar size="sm" src={isOwedByMe ? debt.creditorAvatar : debt.debtorAvatar} />
                    <VStack align="start" spacing={0}>
                      {isOwedByMe ? (
                        <Text fontSize="sm" color="gray.800" fontWeight="medium">
                          You owe <Text as="span" fontWeight="bold">{debt.creditorName}</Text>
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.800" fontWeight="medium">
                          <Text as="span" fontWeight="bold">{debt.debtorName}</Text> owes you
                        </Text>
                      )}
                      <Text fontSize="sm" color={isOwedByMe ? "#EF4444" : "#10B981"} fontWeight="bold">
                        {currentUser.currency}{debt.amount.toFixed(2)}
                      </Text>
                    </VStack>
                  </HStack>

                  {isOwedByMe ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      color="#EF4444" 
                      borderColor="#EF4444" 
                      borderRadius="16px"
                      onClick={() => handleAction(debt.id, 'mark_paid')}
                      _hover={{ bg: 'red.50' }}
                    >
                      Mark as Paid
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      bg="#10B981" 
                      color="white" 
                      borderRadius="16px"
                      onClick={() => handleAction(debt.id, 'confirm_receipt')}
                      _hover={{ bg: '#0ea5e9' }}
                    >
                      Confirm Receipt
                    </Button>
                  )}
                </Flex>
              );
            })}
          </VStack>
        </Box>

        {/* 4. Recent Activity List */}
        <Box mb={4}>
          <Heading as="h2" size="md" color="gray.800" mb={4} fontWeight="semibold">
            Recent Activity
          </Heading>
          <VStack spacing={4} align="stretch">
            {recentTransactions.map((tx) => (
              <Flex key={tx.id} align="center" justify="space-between">
                <HStack spacing={4}>
                  <Flex 
                    w={10} h={10} 
                    borderRadius="12px" 
                    bg={tx.type === 'received' ? 'green.100' : 'red.100'} 
                    align="center" justify="center"
                  >
                    {tx.type === 'received' ? <ArrowDownLeft color="#10B981" size={20}/> : <ArrowUpRight color="#EF4444" size={20}/>}
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.800" fontWeight="medium">{tx.description}</Text>
                    <Text fontSize="xs" color="gray.400">{tx.timestamp}</Text>
                  </VStack>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color={tx.type === 'received' ? "#10B981" : "gray.800"}>
                  {tx.type === 'received' ? '+' : '-'}{currentUser.currency}{tx.amount.toFixed(2)}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Box>

      {/* 5. Bottom Navigation */}
      <Flex 
        position="fixed" 
        bottom={0} 
        left={0} 
        right={0} 
        h="80px" 
        bg="rgba(255, 255, 255, 0.85)" 
        backdropFilter="blur(12px)" 
        borderTop="1px solid" 
        borderColor="gray.100"
        align="center" 
        justify="space-around"
        px={6}
        pb={4} // Safe area adjustment
      >
        <VStack spacing={1} color="#4F46E5" cursor="pointer">
          <Home size={24} />
          <Text fontSize="2xs" fontWeight="medium">Home</Text>
        </VStack>
        
        {/* FAB for Scanning */}
        <Box position="relative" top="-20px">
          <IconButton
            aria-label="Scan Receipt"
            icon={<ScanLine size={28} color="white" />}
            bg="#4F46E5"
            w="64px"
            h="64px"
            borderRadius="full"
            boxShadow="0 8px 20px rgba(79, 70, 229, 0.4)"
            _hover={{ bg: '#4338ca', transform: 'scale(1.05)' }}
            _active={{ transform: 'scale(0.95)' }}
            transition="all 0.2s"
            onClick={handleScanReceipt}
          />
        </Box>

        <VStack spacing={1} color="gray.400" cursor="pointer">
          <Users size={24} />
          <Text fontSize="2xs" fontWeight="medium">Groups</Text>
        </VStack>
      </Flex>
    </Box>
  );
}

export default Dashboard;