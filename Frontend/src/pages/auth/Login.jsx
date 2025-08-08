import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Button,
  VStack,
  Heading,
  Link,
  useToast,
} from "@chakra-ui/react";
import { Mail, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // Show session expired toast if redirected with sessionExpired flag
  useEffect(() => {
    if (location.state?.sessionExpired) {
      toast({
        title: "Session expired",
        description: "Please login again.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  }, [location, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side field check
    if (!username || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both username and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const { data } = await axiosInstance.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );

      const { accessToken, user } = data;

      if (user.employeeStatus !== 1) {
        toast({
          title: "Inactive Account",
          description: "Your account is inactive. Please contact support.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      // Save token and user info to context
      authLogin(accessToken, user);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Redirect user based on role
      setTimeout(() => {
        navigate(user.role === "employee" ? "/employee-dashboard" : "/");
      }, 1500);

      // Optional: clear form
      setUsername("");
      setPassword("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";

      toast({
        title: "Login Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="whiteAlpha.900"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradients */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w="full"
        h="full"
        bgGradient="linear(to-br, blue.200, blue.400)"
        opacity="0.7"
        clipPath="polygon(0 0, 100% 0, 100% 70%, 0 100%)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="0"
        right="0"
        w="full"
        h="full"
        bgGradient="linear(to-tl, blue.300, blue.500)"
        opacity="0.7"
        clipPath="polygon(0 30%, 100% 0, 100% 100%, 0 100%)"
        zIndex={0}
      />

      {/* Login form */}
      <Box
        zIndex={1}
        bg="whiteAlpha.900"
        p={8}
        rounded="2xl"
        shadow="xl"
        w="full"
        maxW="md"
      >
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          color="blue.700"
          fontWeight="extrabold"
          mb={8}
        >
          Welcome Back!
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            {/* Username */}
            <FormControl isRequired>
              <FormLabel color="blue.600">Username</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Mail size={18} color="#60A5FA" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  borderColor="blue.300"
                  focusBorderColor="blue.500"
                />
              </InputGroup>
            </FormControl>

            {/* Password */}
            <FormControl isRequired>
              <FormLabel color="blue.600">Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Lock size={18} color="#60A5FA" />
                </InputLeftElement>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderColor="blue.300"
                  focusBorderColor="blue.500"
                />
              </InputGroup>
            </FormControl>

            {/* Forgot password (optional link) */}
            <Box w="full" textAlign="center">
              <Link
                href="#"
                fontSize="sm"
                fontWeight="medium"
                color="blue.600"
                _hover={{ color: "blue.800" }}
              >
                Forgot your password?
              </Link>
            </Box>

            {/* Submit button */}
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              size="lg"
              fontWeight="bold"
              shadow="md"
              _hover={{ bg: "blue.700" }}
            >
              Log In
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
