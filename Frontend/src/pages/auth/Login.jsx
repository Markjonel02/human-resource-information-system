import React, { useState } from "react";
import Bg from "../../assets/pexels-cowomen-1058097-2041627.jpg";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Button,
  Text,
  VStack,
  Heading,
  Link,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { axiosInstance } from "../../lib/axiosInstance"; // Assuming axiosInstance is configured correctly
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/Auth"; // Import the Auth context

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        status: "warning", // Changed from 'danger' to 'warning' for Chakra UI status
        duration: 3000,
        isClosable: true,
        position: "top", // Added position to top
      });
      return; // Stop execution if fields are missing
    }

    try {
      // Make API call to the backend login endpoint
      const response = await axiosInstance.post(
        `/auth/login`, // Endpoint for login
        { username, password }, // Send username and password
        {
          withCredentials: true, // Important for sending/receiving HTTP-only cookies (refresh token)
        }
      );

      // Extract accessToken and user data from the successful response
      const { accessToken, user } = response.data;

      // Update authentication state using the Auth context's login function
      authLogin(accessToken, user);

      // Display success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top", // Added position to top
      });

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        navigate("/"); // Navigate to the root path, which is protected and leads to Dashboard
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
        position: "top", // Added position to top
        variant: "subtle", // Optional: Change toast variant
        colorScheme: "red", // Optional: Change color scheme for better visibility
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

      {/* HRIS Masked Text */}
      {/* <Box
        position="absolute"
        inset="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={0}
        pointerEvents="none"
      >
        <Text
          fontSize={["9rem", "12rem", "25em"]}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight="1"
          style={{
            backgroundImage: `url(${Bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            opacity: 0.3,
          }}
        >
          HRIS
        </Text>
      </Box> */}

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
                  <Mail size={18} color="#60A5FA" />{" "}
                  {/* Using Mail icon for username, consider a user icon if available */}
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
