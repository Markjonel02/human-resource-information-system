import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  HStack,
  Spacer,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useBreakpointValue,
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
  Menu as MenuIcon,
} from "lucide-react";

const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Detect screen size (true if mobile)
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Reset collapse on mobile, but allow collapse on desktop
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false); // force expanded on mobile
    }
  }, [isMobile]);

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

  const SidebarContent = ({ forceExpanded = false }) => {
    const collapsed = forceExpanded ? false : isCollapsed;

    return (
      <Box
        position="sticky"
        top="0"
        left="0"
        zIndex="1000"
        w={collapsed ? "20" : "64"}
        h="100vh"
        bg="white"
        p="4"
        shadow="lg"
        borderRightRadius="xl"
        display="flex"
        flexDirection="column"
        transition="width 0.2s ease"
      >
        {/* Header */}
        <Flex
          align="center"
          justify={collapsed ? "center" : "space-between"}
          pb="4"
          borderBottom="1px"
          borderColor="gray.200"
          mb="6"
        >
          {!collapsed ? (
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
                LOGO
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

          {/* Collapse button: only visible on desktop */}
          {!isMobile && (
            <Icon
              as={collapsed ? ChevronRight : ChevronLeft}
              w={5}
              h={5}
              color="gray.500"
              cursor="pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
              ml={collapsed ? "auto" : "0"}
            />
          )}
        </Flex>

        {/* MENU Section */}
        <Box mb="8">
          {!collapsed && (
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.400"
              textTransform="uppercase"
              px="3"
              mb="3"
            >
              MENU
            </Text>
          )}
          <VStack spacing="1" align="stretch">
            {menuItems.map((item, idx) => (
              <Flex
                key={idx}
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
                justifyContent={collapsed ? "center" : "flex-start"}
              >
                <Icon
                  as={item.icon}
                  w={5}
                  h={5}
                  mr={collapsed ? "0" : "3"}
                  color={item.active ? "purple.600" : "gray.500"}
                />
                {!collapsed && <Text>{item.label}</Text>}
              </Flex>
            ))}
          </VStack>
        </Box>

        <Spacer />

        {/* USER Section */}
        <Box mt="auto">
          {!collapsed && (
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.400"
              textTransform="uppercase"
              px="3"
              mb="3"
            >
              USER
            </Text>
          )}
          <VStack spacing="1" align="stretch">
            {userItems.map((item, idx) => (
              <Flex
                key={idx}
                as="a"
                href="#"
                align="center"
                p="3"
                rounded="lg"
                color="gray.700"
                _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                transition="all 0.2s"
                justifyContent={collapsed ? "center" : "flex-start"}
              >
                <Icon
                  as={item.icon}
                  w={5}
                  h={5}
                  mr={collapsed ? "0" : "3"}
                  color="gray.500"
                />
                {!collapsed && <Text>{item.label}</Text>}
              </Flex>
            ))}
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {/* Hamburger menu for mobile - hidden when drawer is open */}
      {isMobile && !isOpen && (
        <Box p="4" position="absolute" top="0" bg="white" zIndex="999">
          <IconButton
            icon={<MenuIcon />}
            aria-label="Open Menu"
            onClick={onOpen}
            variant="outline"
          />
        </Box>
      )}

      {/* Drawer on mobile (force expanded) */}
      {isMobile ? (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <SidebarContent forceExpanded />
          </DrawerContent>
        </Drawer>
      ) : (
        // Always render SidebarContent on desktop, respect collapse state
        <SidebarContent />
      )}
    </>
  );
};

export default SideNavigation;
