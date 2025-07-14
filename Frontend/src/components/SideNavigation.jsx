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
  IconButton,
  useBreakpointValue,
  Tooltip, // Import Tooltip
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
import { Link, useLocation } from "react-router-dom";

const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Users, label: "Employees", path: "/employees" },
    { icon: CheckSquare, label: "Attendances", path: "/attendances" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: LogOut, label: "Leaves", path: "/leaves" },
    { icon: DollarSign, label: "Payroll", path: "/payroll" },
    { icon: FileText, label: "Documents", path: "/documents" },
  ];

  const userItems = [
    { icon: Grid, label: "Apps & Integration", path: "/apps" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Headset, label: "Help & Support", path: "/help" },
  ];

  const activeBg = useColorModeValue("purple.50", "purple.900");
  const activeColor = useColorModeValue("purple.700", "purple.300");

  const SidebarContent = ({ forceExpanded = false, hideHeader = false }) => {
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
        borderRightWidth={isMobile ? "0" : "1px"}
        borderColor="gray.200"
        display="flex"
        flexDirection="column"
        transition="width 0.2s ease"
      >
        {!hideHeader && (
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
        )}

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
              <Link key={idx} to={item.path}>
                {collapsed ? (
                  <Tooltip label={item.label} placement="right">
                    <Flex
                      align="center"
                      p="3"
                      rounded="lg"
                      bg={
                        location.pathname === item.path
                          ? activeBg
                          : "transparent"
                      }
                      color={
                        location.pathname === item.path
                          ? activeColor
                          : "gray.700"
                      }
                      fontWeight={
                        location.pathname === item.path ? "medium" : "normal"
                      }
                      _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                      transition="all 0.2s"
                      justifyContent="center" // Centered for collapsed
                    >
                      <Icon
                        as={item.icon}
                        w={5}
                        h={5}
                        color={
                          location.pathname === item.path
                            ? "purple.600"
                            : "gray.500"
                        }
                      />
                    </Flex>
                  </Tooltip>
                ) : (
                  <Flex
                    align="center"
                    p="3"
                    rounded="lg"
                    bg={
                      location.pathname === item.path ? activeBg : "transparent"
                    }
                    color={
                      location.pathname === item.path ? activeColor : "gray.700"
                    }
                    fontWeight={
                      location.pathname === item.path ? "medium" : "normal"
                    }
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                    transition="all 0.2s"
                    justifyContent="flex-start"
                  >
                    <Icon
                      as={item.icon}
                      w={5}
                      h={5}
                      mr="3"
                      color={
                        location.pathname === item.path
                          ? "purple.600"
                          : "gray.500"
                      }
                    />
                    <Text>{item.label}</Text>
                  </Flex>
                )}
              </Link>
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
              <Link key={idx} to={item.path}>
                {collapsed ? (
                  <Tooltip label={item.label} placement="right">
                    <Flex
                      align="center"
                      p="3"
                      rounded="lg"
                      color="gray.700"
                      _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                      transition="all 0.2s"
                      justifyContent="center" // Centered for collapsed
                    >
                      <Icon as={item.icon} w={5} h={5} color="gray.500" />
                    </Flex>
                  </Tooltip>
                ) : (
                  <Flex
                    align="center"
                    p="3"
                    rounded="lg"
                    color="gray.700"
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                    transition="all 0.2s"
                    justifyContent="flex-start"
                  >
                    <Icon as={item.icon} w={5} h={5} mr="3" color="gray.500" />
                    <Text>{item.label}</Text>
                  </Flex>
                )}
              </Link>
            ))}
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {isMobile && !isOpen && (
        <Box position="absolute" p={4} top="0" zIndex="999">
          <IconButton
            icon={<MenuIcon />}
            aria-label="Open Menu"
            onClick={onOpen}
            variant="outline"
          />
        </Box>
      )}

      {isMobile ? (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent p="4" bg="white" w="64">
            <Flex
              align="center"
              justify="space-between"
              mb="6"
              pb="4"
              borderBottom="1px"
              borderColor="gray.200"
            >
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
              <IconButton
                icon={<ChevronLeft />}
                aria-label="Close Menu"
                onClick={onClose}
                size="sm"
                variant="ghost"
              />
            </Flex>
            <SidebarContent forceExpanded hideHeader />
          </DrawerContent>
        </Drawer>
      ) : (
        <SidebarContent />
      )}
    </>
  );
};

export default SideNavigation;
