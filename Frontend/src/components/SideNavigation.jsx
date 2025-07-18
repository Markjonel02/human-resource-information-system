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
  Tooltip,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  Home,
  Users,
  CheckSquare,
  Calendar,
  LogOut,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Clock,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineMonitor } from "react-icons/ai";
import { MdOutlineRequestPage } from "react-icons/md";

const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
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
    { icon: MdOutlineRequestPage, label: "Request", path: "/request" },
    { icon: DollarSign, label: "Payroll", path: "/payroll" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: AiOutlineMonitor, label: "Monitoring", path: "/monitoring" },
  ];

  const userItems = [{ icon: Settings, label: "Settings", path: "/settings" }];

  const loggedInUser = {
    name: "John Doe",
    avatarUrl: "https://bit.ly/dan-abramov",
  };

  const activeBg = useColorModeValue("purple.50", "purple.900");
  const activeColor = useColorModeValue("purple.700", "purple.300");

  const SidebarContent = ({ forceExpanded = false, hideHeader = false }) => {
    const collapsed = forceExpanded ? false : isCollapsed;

    const handleLogout = () => {
      navigate("/logout");
    };

    return (
      <Box
        position="sticky"
        top="0"
        left="0"
        zIndex="1000"
        w={collapsed ? "30" : "55"}
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
                  justifyContent={collapsed ? "center" : "flex-start"}
                >
                  <Icon
                    as={item.icon}
                    w={5}
                    h={5}
                    mr={collapsed ? 0 : 3}
                    color={
                      location.pathname === item.path
                        ? "purple.600"
                        : "gray.500"
                    }
                  />
                  {!collapsed && <Text>{item.label}</Text>}
                </Flex>
              </Link>
            ))}
          </VStack>
        </Box>

        <Spacer />

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
                  justifyContent={collapsed ? "center" : "flex-start"}
                >
                  <Icon
                    as={item.icon}
                    w={5}
                    h={5}
                    mr={collapsed ? 0 : 3}
                    color="gray.500"
                  />
                  {!collapsed && <Text>{item.label}</Text>}
                </Flex>
              </Link>
            ))}

            <Menu placement={collapsed ? "right-start" : "top-start"}>
              <MenuButton
                as={Flex}
                align="center"
                p="3"
                rounded="lg"
                bg={useColorModeValue("gray.50", "gray.700")}
                color="gray.700"
                _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                transition="all 0.2s"
                justifyContent={collapsed ? "center" : "flex-start"}
                cursor="pointer"
                w="full"
              >
                {collapsed ? (
                  <Tooltip label={loggedInUser.name} placement="right">
                    <Avatar size="sm" src={loggedInUser.avatarUrl} />
                  </Tooltip>
                ) : (
                  <Flex align="center">
                    <Avatar size="sm" src={loggedInUser.avatarUrl} mr={2} />
                    <Text fontWeight="medium">{loggedInUser.name}</Text>
                  </Flex>
                )}
              </MenuButton>
              <MenuList
                bg={useColorModeValue("white", "gray.800")}
                borderColor={useColorModeValue("gray.200", "gray.700")}
                shadow="lg"
                rounded="md"
                py="2"
              >
                <Link to="/timein" onClick={onClose}>
                  <MenuItem
                    icon={<Icon as={Clock} w={4} h={4} />}
                    color={useColorModeValue("gray.700", "gray.200")}
                  >
                    Time In/Out
                  </MenuItem>
                </Link>
                <MenuItem
                  icon={<Icon as={LogOut} w={4} h={4} />}
                  onClick={handleLogout}
                  _hover={{ bg: useColorModeValue("red.50", "red.900") }}
                  color={useColorModeValue("red.500", "red.300")}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
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
