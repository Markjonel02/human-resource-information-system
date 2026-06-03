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
// FIX: Ensure this import name matches exactly what you use below
import AddemployeeButton from "./addemployeeButton";
import { useAuth } from "../context/AuthContext";
import AddingAttendanceButton from "./AddingAttendanceButton";

const TopNavigations = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");

  const { authState } = useAuth();
  const userFirstName = authState?.user?.firstname || "Guest";
  const role = authState?.user?.role || "User";

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
        <Box
          textAlign={{ base: "center", md: "left" }}
          mb={{ base: 2, md: 0 }}
          ml={{ base: 10, md: 0 }}
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={textColor}
          >
            Welcome back,{" "}
            <Text
              as="span"
              color="purple.600"
              textAlign={{ base: "center", md: "left" }}
            >
              {userFirstName}{" "}
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
          {(role === "admin" || role === "hr") && (
            <Tooltip label="Add Employee" openDelay={500}>
              <Box display="block">
                {/* FIX: Changed to a lowercase 'e' to match the import */}
                <AddemployeeButton />
              </Box>
            </Tooltip>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavigations;
