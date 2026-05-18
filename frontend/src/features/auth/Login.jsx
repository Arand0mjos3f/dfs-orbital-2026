// src/features/auth/Login.jsx
import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  FormErrorMessage,
  useToast,
  Container,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Mock submit handler
  const onSubmit = async (data) => {
    try {
      // TODO: Replace with actual API call: await apiClient.post('/auth/login', data)
      console.log('Login Payload:', data);
      
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock successful login
      localStorage.setItem('dfs_token', 'mock_jwt_token_123');
      
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <VStack spacing="8" align="stretch">
        <Box textAlign="center">
          <Heading size="xl" fontWeight="extrabold" mb="2">
            Welcome to DFS
          </Heading>
          <Text color="gray.500">Sign in to manage your groups.</Text>
        </Box>

        <Box
          py="8"
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow={{ base: 'none', sm: 'xl' }}
          borderRadius={{ base: 'none', sm: '2xl' }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing="6">
              <FormControl isInvalid={errors.email}>
                <FormLabel htmlFor="email" fontWeight="medium">
                  Email
                </FormLabel>
                <Input
                  id="email"
                  type="email"
                  size="lg"
                  placeholder="you@example.com"
                  bg="gray.50"
                  _focus={{ bg: 'white', borderColor: 'blue.400' }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <FormLabel htmlFor="password" fontWeight="medium">
                  Password
                </FormLabel>
                <Input
                  id="password"
                  type="password"
                  size="lg"
                  placeholder="••••••••"
                  bg="gray.50"
                  _focus={{ bg: 'white', borderColor: 'blue.400' }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Signing in..."
                mt="2"
                boxShadow="md"
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Box>

        <Text textAlign="center" color="gray.600">
          Don't have an account?{' '}
          <ChakraLink
            as={RouterLink}
            to="/register"
            color="blue.500"
            fontWeight="bold"
          >
            Sign up
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default Login;