import React, { useState, useEffect, useRef } from "react"; // Import useRef
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
  Button, // Ensure Button is imported for AlertDialog
  AlertDialog, // Import AlertDialog components
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
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
import { useAuth } from "../context/AuthContext"; // Correct import path for Auth context

const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // For the mobile drawer
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  // Get authState and logout function from AuthContext
  const { authState, logout: authLogout } = useAuth();
  const loggedInUser = authState.user; // Get the user object from authState

  // For Logout Confirmation Dialog
  const {
    isOpen: isLogoutAlertOpen,
    onOpen: onOpenLogoutAlert,
    onClose: onCloseLogoutAlert,
  } = useDisclosure();
  const cancelRef = useRef(); // Ref for the cancel button in AlertDialog

  // Function to handle logout confirmation (opens the AlertDialog)
  const handleLogout = () => {
    onOpenLogoutAlert(); // Open the AlertDialog for confirmation
    if (isMobile) {
      onClose(); // Close the mobile drawer immediately if open
    }
  };

  // Function to perform logout after confirmation
  const handleConfirmLogout = () => {
    console.log("SideNavigation: Logging out...");
    authLogout(); // Call the logout function from AuthContext
    onCloseLogoutAlert(); // Close the AlertDialog
    // AuthContext's logout function handles navigation to /login
  };

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false); // Sidebar is always expanded on mobile when drawer is open
    }
  }, [isMobile]);

  // Determine the dashboard path based on the user's role
  const dashboardPath =
    loggedInUser?.role === "employee" ? "/employee-dashboard" : "/";

  const EmployeeRoutespath =
    loggedInUser?.role === "employee"
      ? "/employees-attendance"
      : "/attendances";
  const leavePath =
    loggedInUser?.role === "employee" ? "/employees-requests" : "/request";

  const calendarPath =
    loggedInUser?.role === "employee" ? "/employee-calendar" : "/calendar";

  const employeeDocumentsPath =
    loggedInUser?.role === "employee" ? "/employee-documents" : "/documents";
  const menuItems = [
    // Dynamically set the Dashboard path
    { icon: Home, label: "Dashboard", path: dashboardPath },
    {
      icon: Users,
      label: "Employees",
      path: "/employees",
      roles: ["admin", "hr"],
    }, // Add a 'roles' property

    { icon: CheckSquare, label: "Attendances", path: EmployeeRoutespath },
    { icon: Calendar, label: "Calendar", path: calendarPath },
    { icon: MdOutlineRequestPage, label: "Request", path: leavePath },
    { icon: DollarSign, label: "Payroll", path: "/payroll" },
    { icon: FileText, label: "Documents", path: employeeDocumentsPath },
    { icon: AiOutlineMonitor, label: "Monitoring", path: "/monitoring" },
  ].filter((item) => {
    // If an item has specific roles defined, only show it if the user's role is included
    // Otherwise, show it to everyone (or if no roles are specified, assume it's for all)
    if (item.roles) {
      return item.roles.includes(loggedInUser?.role);
    }
    return true; // Show items that don't have a 'roles' property defined
  });

  const userItems = [{ icon: Settings, label: "Settings", path: "/settings" }];

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
              <Link
                key={idx}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
              >
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
              <Link
                key={idx}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
              >
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
                  <Tooltip
                    label={loggedInUser?.firstname || "Guest"}
                    placement="right"
                  >
                    <Avatar size="sm" src={loggedInUser?.avatarUrl || ""} />
                  </Tooltip>
                ) : (
                  <Flex align="center">
                    <Avatar
                      size="sm"
                      src={loggedInUser?.avatarUrl || ""}
                      mr={2}
                    />
                    <Text fontWeight="medium">
                      {loggedInUser?.firstname || "Guest"}
                    </Text>
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
                <Link to="/timein" onClick={isMobile ? onClose : undefined}>
                  <MenuItem
                    icon={<Icon as={Clock} w={4} h={4} />}
                    color={useColorModeValue("gray.700", "gray.200")}
                  >
                    Time In/Out
                  </MenuItem>
                </Link>
                <MenuItem
                  icon={<Icon as={LogOut} w={4} h={4} />}
                  onClick={handleLogout} // Now calls the handleLogout in parent scope
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
            {/* Pass handleLogout and handleConfirmLogout as props if SidebarContent needed to directly call them */}
            <SidebarContent forceExpanded hideHeader />
          </DrawerContent>
        </Drawer>
      ) : (
        <SidebarContent />
      )}

      {/* Logout Confirmation AlertDialog */}
      <AlertDialog
        isOpen={isLogoutAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseLogoutAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="lg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Logout
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to log out? You will need to log in again to
              access your account.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onCloseLogoutAlert}
                borderRadius="md"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmLogout}
                ml={3}
                borderRadius="md"
              >
                Log Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default SideNavigation;
