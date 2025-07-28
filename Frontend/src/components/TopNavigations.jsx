import React from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { SearchIcon, CalendarIcon } from "@chakra-ui/icons";
import AddEmployeeButton from "./AddemployeeButton";
import { useAuth } from "../context/AuthContext"; // Correct path to Auth context

const TopNavigations = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");

  // Correctly access authState, then user from authState
  const { authState } = useAuth();
  const userFirstName = authState?.user?.firstname || "Guest"; // Safely access firstname
  const role = authState?.user?.role || "User"; // Safely access role
  return (
    <Box
      bg={bgColor}
      px={{ base: 4, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between" flexDirection="row">
        {/* Welcome Section */}
        <Box textAlign="left">
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={textColor}
          >
            Welcome back,{" "}
            <Text as="span" color="purple.600">
              {userFirstName}{" "}
              {/* This will now correctly display the first name */}
            </Text>
          </Text>
          <Text
            fontSize="sm"
            color="gray.500"
            display={{ base: "none", md: "block" }}
          >
            {role}
          </Text>
        </Box>

        {/* Search and Buttons Section */}
        <Flex align="center">
          {/* Search Input */}
          <InputGroup
            width="200px"
            mr={4}
            display={{ base: "none", md: "block", lg: "block" }}
          >
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search..." borderRadius="md" />
          </InputGroup>

          {/* Add Employee Button */}
          <Tooltip label="Add Employee" openDelay={500}>
            <Box display={{ base: "none", md: "none", lg: "block" }}>
              <AddEmployeeButton />
            </Box>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavigations;
