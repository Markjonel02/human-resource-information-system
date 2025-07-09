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
  Spacer, // Spacer is not strictly needed with space-between but kept for completeness
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { SearchIcon, CalendarIcon } from "@chakra-ui/icons";
import { FaPlus } from "react-icons/fa";

const TopNavigations = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");
  const buttonBgColor = useColorModeValue("blue.600", "blue.500");
  const buttonHoverBgColor = useColorModeValue("blue.700", "blue.600");

  return (
    <Box
      bg={bgColor}
      px={{ base: 4, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex
        align="center"
        justify={{ base: "space-between", md: "space-between" }}
        flexDirection={{ base: "row", md: "row" }}
      >
        {/* Welcome Section - Aligned left on desktop, now also left on mobile within its own flex container */}
        <Box textAlign={{ base: "left", md: "left" }}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={textColor}
            textAlign="center"
            ml={{ base: 20, md: 0 }}
          >
            Welcome back,{" "}
            <Text as="span" color="purple.600">
              Ronald
            </Text>
          </Text>
          <Text
            fontSize="sm"
            color="gray.500"
            display={{ base: "none", md: "block" }}
          >
            Home
          </Text>
        </Box>

        {/* Search and Buttons Section */}
        <Flex align="center">
          {/* Search Input - Hidden on mobile */}
          <InputGroup
            width="200px"
            mr={4}
            display={{ base: "none", md: "block" }}
          >
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search..." borderRadius="md" />
          </InputGroup>

          {/* Icon Buttons with Tooltips - Hidden on mobile */}

          {/* Attendance Button - Hidden on mobile */}
          <Button
            leftIcon={<CalendarIcon />}
            variant="outline"
            mr={4}
            borderRadius="md"
            colorScheme="gray"
            display={{ base: "none", md: "inline-flex" }}
          >
            Attendance
          </Button>

          {/* Add Employee Button (Responsive) */}
          <Tooltip
            label="Add Employee"
            aria-label="Add Employee tooltip"
            openDelay={500}
          >
            <Button
              leftIcon={<FaPlus />}
              bg={buttonBgColor}
              color="white"
              _hover={{ bg: buttonHoverBgColor }}
              borderRadius="md"
              px={{ base: 3, md: 4 }}
            >
              {/* Text visible only on medium and larger screens */}
              <Text as="span" display={{ base: "none", md: "inline" }}>
                Add Employee
              </Text>
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavigations;
