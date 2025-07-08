import React from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  IconButton,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon, CalendarIcon } from "@chakra-ui/icons";
import { FaPlus } from "react-icons/fa"; // Using react-icons for the plus icon

const TopNavigations = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");
  const buttonBgColor = useColorModeValue("blue.600", "blue.500");
  const buttonHoverBgColor = useColorModeValue("blue.700", "blue.600");

  return (
    <Box
      bg={bgColor}
      px={6}
      py={4}
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex align="center">
        {/* Welcome Section */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Welcome back,{" "}
            <Text as="span" color="purple.600">
              Ronald
            </Text>
          </Text>
          <Text fontSize="sm" color="gray.500">
            Home
          </Text>
        </Box>

        <Spacer />

        {/* Search and Buttons Section */}
        <Flex align="center">
          {/* Search Input */}
          <InputGroup width="200px" mr={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search..." borderRadius="md" />
          </InputGroup>

          {/* Icon Buttons */}
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            variant="outline"
            mr={2}
            borderRadius="md"
          />
          <IconButton
            aria-label="Calendar"
            icon={<CalendarIcon />}
            variant="outline"
            mr={4}
            borderRadius="md"
          />

          {/* Attendance Button */}
          <Button
            leftIcon={<CalendarIcon />}
            variant="outline"
            mr={4}
            borderRadius="md"
            colorScheme="gray"
          >
            Attendance
          </Button>

          {/* Add Employee Button */}
          <Button
            leftIcon={<FaPlus />}
            bg={buttonBgColor}
            color="white"
            _hover={{ bg: buttonHoverBgColor }}
            borderRadius="md"
          >
            Add Employee
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavigations;
