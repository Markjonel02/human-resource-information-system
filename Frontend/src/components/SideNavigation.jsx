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
  X, // For the mobile close icon
} from "lucide-react";

const SideNavigation = () => {
  // State for desktop collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for mobile sidebar open/close
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Detect screen size (true if mobile, md breakpoint and below)
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Effect to manage collapse state based on screen size
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false); // Force expanded on mobile for the mobile sidebar content
    }
    // No need to set isMobileSidebarOpen here, it's controlled by the hamburger icon
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

  // Helper component for section labels
  const SectionLabel = ({ label, isSidebarCollapsed }) => (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="gray.400"
      textTransform="uppercase"
      mb="3"
      pl="3" // Always left aligned
      textAlign={isSidebarCollapsed ? "center" : "left"} // Center label when collapsed
    >
      {isSidebarCollapsed ? label.charAt(0) : label}{" "}
      {/* Show first letter when collapsed */}
    </Text>
  );

  // Reusable Sidebar content JSX
  const SidebarContent = ({ currentCollapsedState, onCloseMobile }) => {
    return (
      <Box
        w={currentCollapsedState ? "20" : "64"}
        h="100vh"
        bg="white"
        p="4"
        shadow="lg"
        borderRightRadius="xl"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          align="center"
          justify={currentCollapsedState ? "center" : "space-between"}
          pb="4"
          borderBottom="1px"
          borderColor="gray.200"
          mb="6"
        >
          {!currentCollapsedState ? (
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

          {/* Toggle button for desktop, Close button for mobile */}
          {isMobile ? (
            <Icon
              as={X}
              w={5}
              h={5}
              color="gray.500"
              cursor="pointer"
              onClick={onCloseMobile}
              ml="auto"
            />
          ) : (
            <Icon
              as={currentCollapsedState ? ChevronRight : ChevronLeft}
              w={5}
              h={5}
              color="gray.500"
              cursor="pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
              ml={currentCollapsedState ? "auto" : "0"}
            />
          )}
        </Flex>

        {/* MENU Section */}
        <Box mb="8">
          <SectionLabel
            label="Menu"
            isSidebarCollapsed={currentCollapsedState}
          />
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
                justifyContent={currentCollapsedState ? "center" : "flex-start"}
              >
                <Icon
                  as={item.icon}
                  w={5}
                  h={5}
                  mr={currentCollapsedState ? "0" : "3"}
                  color={item.active ? "purple.600" : "gray.500"}
                />
                {!currentCollapsedState && <Text>{item.label}</Text>}
              </Flex>
            ))}
          </VStack>
        </Box>

        <Spacer />

        {/* USER Section */}
        <Box mt="auto">
          <SectionLabel
            label="User"
            isSidebarCollapsed={currentCollapsedState}
          />
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
                justifyContent={currentCollapsedState ? "center" : "flex-start"}
              >
                <Icon
                  as={item.icon}
                  w={5}
                  h={5}
                  mr={currentCollapsedState ? "0" : "3"}
                  color="gray.500"
                />
                {!currentCollapsedState && <Text>{item.label}</Text>}
              </Flex>
            ))}
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <Box position="relative" minH="100vh" display="flex" width="100%">
      {" "}
      {/* This Box will be the relative parent for absolute positioning */}
      {/* Hamburger menu for mobile, only visible when sidebar is NOT open */}
      {isMobile && !isMobileSidebarOpen && (
        <IconButton
          icon={<MenuIcon />}
          aria-label="Open Menu"
          onClick={() => setIsMobileSidebarOpen(true)}
          position="fixed" // Keep burger fixed so it's always accessible
          top="4"
          left="4"
          zIndex="1001" // Higher than sidebar and overlay
          variant="outline"
          rounded="md"
          shadow="md"
        />
      )}
      {/* Mobile Sidebar (absolute positioned) */}
      {isMobile && (
        <Box
          position="absolute"
          top="0"
          left={isMobileSidebarOpen ? "0" : "-64"} // Slide in/out
          zIndex="1000"
          transition="left 0.2s ease-in-out"
          display={isMobileSidebarOpen ? "block" : "none"} // Hide when closed to prevent interaction
        >
          <SidebarContent
            currentCollapsedState={false}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </Box>
      )}
      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <Box
          position="fixed" // Overlay should be fixed to cover the entire viewport
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.300"
          zIndex="999" // Between burger and sidebar
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {/* Desktop Sidebar */}
      {!isMobile && <SidebarContent currentCollapsedState={isCollapsed} />}
    </Box>
  );
};

export default SideNavigation;
