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
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      toast({
        title: "Login Successful.",
        description: "Login attempt successful! (This is a demo)",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      console.log("Email:", email, "Password:", password);
      setEmail("");
      setPassword("");
    } else {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
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
      bg="blue.50"
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
      <Box
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
      </Box>

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
            {/* Email */}
            <FormControl isRequired>
              <FormLabel color="blue.600">Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Mail size={18} color="#60A5FA" />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            {/* Forgot Password */}
            <Box w="full" textAlign="right">
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

        {/* Sign Up */}
        <Text mt={8} textAlign="center" fontSize="sm" color="blue.500">
          Don't have an account?{" "}
          <Link
            href="#"
            fontWeight="medium"
            color="blue.600"
            _hover={{ color: "blue.800" }}
          >
            Sign up now
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
