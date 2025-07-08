import React, { useState } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  HStack,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Home,
  Users,
  CheckSquare,
  Calendar,
  LogOut,
  DollarSign,
  FileText,
  Grid,
  Settings,
  Headset,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Employees" },
    { icon: CheckSquare, label: "Attendances" },
    { icon: Calendar, label: "Calendar" },
    { icon: LogOut, label: "Leaves" },
    { icon: DollarSign, label: "Payroll" },
    { icon: FileText, label: "Documents" },
  ];

  const userItems = [
    { icon: Grid, label: "Apps & Integration" },
    { icon: Settings, label: "Settings" },
    { icon: Headset, label: "Help & Support" },
  ];

  const activeBg = useColorModeValue("purple.50", "purple.900");
  const activeColor = useColorModeValue("purple.700", "purple.300");

  const handleToggleCollapse = () => setIsCollapsed(!isCollapsed);

  const SectionLabel = ({ label }) => (
    <Text
      fontSize={isCollapsed ? "xs" : "xs"}
      fontWeight="semibold"
      color="gray.400"
      textTransform="uppercase"
      mb="3"
      pl="3" // Always left aligned
    >
      {label}
    </Text>
  );

  return (
    <Box
      as="nav"
      w={isCollapsed ? "20" : "64"}
      bg="white"
      shadow="lg"
      p="4"
      borderRightRadius="xl"
      minH="100vh"
      display="flex"
      flexDirection="column"
      transition="width 0.2s ease-in-out"
    >
      {/* Logo & Toggle */}
      <Flex
        align="center"
        justify={isCollapsed ? "center" : "space-between"}
        pb="4"
        borderBottom="1px"
        borderColor="gray.200"
        mb="6"
      >
        {!isCollapsed ? (
          <HStack spacing="2">
            <Flex
              w="8"
              h="8"
              bg="purple.600"
              color="white"
              align="center"
              justify="center"
              rounded="full"
              fontWeight="bold"
              fontSize="sm"
            >
              P
            </Flex>
            <Text fontSize="xl" fontWeight="semibold" color="gray.800">
              Pagedone
            </Text>
          </HStack>
        ) : (
          <Flex
            w="8"
            h="8"
            bg="purple.600"
            color="white"
            align="center"
            justify="center"
            rounded="full"
            fontWeight="bold"
            fontSize="sm"
          >
            P
          </Flex>
        )}

        <Icon
          as={isCollapsed ? ChevronRight : ChevronLeft}
          w={5}
          h={5}
          color="gray.500"
          cursor="pointer"
          onClick={handleToggleCollapse}
          ml={isCollapsed ? "auto" : "0"}
        />
      </Flex>

      {/* MENU Section */}
      <Box mb="8">
        <SectionLabel label="Menu" />
        <VStack spacing="1" align="stretch">
          {menuItems.map((item, index) => (
            <Flex
              key={index}
              as="a"
              href="#"
              align="center"
              p="3"
              rounded="lg"
              bg={item.active ? activeBg : "transparent"}
              color={item.active ? activeColor : "gray.700"}
              fontWeight={item.active ? "medium" : "normal"}
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              transition="all 0.2s"
              justifyContent={isCollapsed ? "center" : "flex-start"}
            >
              <Icon
                as={item.icon}
                w={5}
                h={5}
                mr={isCollapsed ? "0" : "3"}
                color={item.active ? "purple.600" : "gray.500"}
              />
              {!isCollapsed && <Text>{item.label}</Text>}
            </Flex>
          ))}
        </VStack>
      </Box>

      <Spacer />

      {/* USER Section */}
      <Box mt="auto">
        <SectionLabel label="User" />
        <VStack spacing="1" align="stretch">
          {userItems.map((item, index) => (
            <Flex
              key={index}
              as="a"
              href="#"
              align="center"
              p="3"
              rounded="lg"
              color="gray.700"
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              transition="all 0.2s"
              justifyContent={isCollapsed ? "center" : "flex-start"}
            >
              <Icon
                as={item.icon}
                w={5}
                h={5}
                mr={isCollapsed ? "0" : "3"}
                color="gray.500"
              />
              {!isCollapsed && <Text>{item.label}</Text>}
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default SideNavigation;
