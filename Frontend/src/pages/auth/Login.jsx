import React, { useState } from "react";
// import Bg from "../../assets/pexels-cowomen-1058097-2041627.jpg"; // Assuming this is for background image, not directly used in logic
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Button,
  Text, // Not used but kept for completeness
  VStack,
  Heading,
  Link,
  useToast,
  Tooltip,
  useColorModeValue, // Not used but kept for completeness
} from "@chakra-ui/react";
import { axiosInstance } from "../../lib/axiosInstance"; // Assuming axiosInstance is configured correctly
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Corrected import path for Auth context

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState(1); // Assuming default status is active
  const toast = useToast();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Destructure login function from Auth context

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation for empty fields
    if (!username || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both username and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return; // Stop execution if fields are missing
    }

    try {
      // Make API call to the backend login endpoint
      // FIX: Corrected syntax for axios.post options
      const response = await axiosInstance.post(
        `/auth/login`, // Endpoint for login
        { username, password }, // Send username and password in the request body
        {
          withCredentials: true, // Important for sending/receiving HTTP-only cookies (refresh token)
          // No need to manually add Authorization header here for login,
          // as the login endpoint *provides* the token.
        }
      );

      // Extract accessToken and user data from the successful response
      // IMPORTANT: Ensure your backend's /auth/login endpoint sends 'role' in this 'user' object
      const { accessToken, user } = response.data;

      if (user.employeeStatus !== 1) {
        toast({
          title: "Inactive Account",
          description: "Your account is inactive. Please contact support.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return; // Stop login flow if inactive
      }

      // Update authentication state using the Auth context's login function
      // This function should store the accessToken (e.g., in localStorage or state)
      authLogin(accessToken, user);

      // Display success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Redirect based on user role after a short delay
      setTimeout(() => {
        if (user.role === "employee") {
          navigate("/employee-dashboard"); // Redirect employees to /employee-dashboard
        } else {
          navigate("/"); // Redirect others (e.g., admins) to the general dashboard
        }
      }, 1500);

      // Clear input fields after successful login
      setUsername("");
      setPassword("");
    } catch (error) {
      // Log the full error for debugging purposes
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message
      );

      // Determine the error message to display to the user
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";

      // Display error toast
      toast({
        title: "Login Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "subtle",
        colorScheme: "red",
      });
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="whiteAlpha.900"
      p={4}
      overflow="hidden"
    >
      {/* Gradient Background Shapes */}
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

      {/* Login Card */}
      <Box
        zIndex={10}
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
            {/* Username Input */}
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

            {/* Password Input */}
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

            {/* Forgot Password Link */}
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

            {/* Submit Button */}
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
