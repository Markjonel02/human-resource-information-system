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
  Tooltip, // Import Tooltip
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
      px={{ base: 4, md: 6 }} // Less padding on mobile
      py={{ base: 3, md: 4 }} // Less padding on mobile
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex
        align="center"
        justify={{ base: "center", md: "space-between" }} // Center on mobile, space-between on desktop
        flexDirection={{ base: "column", md: "row" }} // Stack on mobile, row on desktop
      >
        {/* Welcome Section */}
        <Box textAlign={{ base: "center", md: "left" }}>
          {" "}
          {/* Center text on mobile */}
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={textColor}
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
            {" "}
            {/* Hide "Home" on mobile */}
            Home
          </Text>
        </Box>

        {/* Search and Buttons Section - Hidden on mobile */}
        <Flex
          align="center"
          display={{ base: "none", md: "flex" }} // Hide on mobile, show on desktop
          mt={{ base: 4, md: 0 }} // Add margin top on mobile if it were visible
        >
          {/* Search Input */}
          <InputGroup width="200px" mr={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search..." borderRadius="md" />
          </InputGroup>

          {/* Icon Buttons with Tooltips */}
          <Tooltip label="Search" aria-label="Search tooltip">
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              variant="outline"
              mr={2}
              borderRadius="md"
            />
          </Tooltip>
          <Tooltip label="Calendar" aria-label="Calendar tooltip">
            <IconButton
              aria-label="Calendar"
              icon={<CalendarIcon />}
              variant="outline"
              mr={4}
              borderRadius="md"
            />
          </Tooltip>

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

          {/* Add Employee Button (Responsive) */}
          <Tooltip label="Add Employee" aria-label="Add Employee tooltip">
            <Button
              leftIcon={<FaPlus />}
              bg={buttonBgColor}
              color="white"
              _hover={{ bg: buttonHoverBgColor }}
              borderRadius="md"
            >
              {/* Text only visible on medium and larger screens */}
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
