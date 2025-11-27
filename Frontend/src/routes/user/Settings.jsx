import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Tooltip,
} from "@chakra-ui/react";
import { NavLink, Routes, Route, useLocation } from "react-router-dom";
import {
  MdPersonOutline,
  MdBadge,
  MdLockOutline,
  MdGroups2,
  MdSettings,
  MdCreditCard,
  MdEmail,
  MdNotificationsNone,
} from "react-icons/md";
import { Navigate } from "react-router-dom";
// Placeholder content components
import Details from "./Details";
import Password from "./ChangePassword";
const Profile = () => <Text>Profile Content</Text>;

// Tabs with Material Design icons
const tabs = [
  { label: "My Details", path: "my-details", icon: MdPersonOutline },
  { label: "Password", path: "password", icon: MdLockOutline },
];

const Settings = () => {
  const location = useLocation();
  const activeColor = useColorModeValue("blue.600", "blue.300");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box px={{ base: 0, md: 8 }} py={6} mx="auto">
      <Flex
        wrap="wrap"
        borderBottom="1px"
        borderColor="blue.200"
        mb={6}
        gap={2}
        justify={{ base: "center", md: "flex-start" }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);

          const displayLabel = useBreakpointValue({
            base:
              tab.label.length > 5 ? `${tab.label.slice(0, 5)}...` : tab.label,
            md: tab.label,
          });

          return (
            <Tooltip key={tab.path} label={tab.label}>
              <NavLink to={`/settings/${tab.path}`}>
                <Flex
                  align="center"
                  gap={2}
                  px={3}
                  py={2}
                  borderBottom={
                    isActive ? "1px solid" : "1px solid transparent"
                  }
                  borderColor={isActive ? activeColor : "transparent"}
                  fontWeight={isActive ? "bold" : "medium"}
                  color={isActive ? activeColor : "gray.600"}
                  fontSize={{ base: "sm" }}
                  _hover={{ color: activeColor }}
                >
                  <Icon as={tab.icon} boxSize={5} />
                  <Text>{displayLabel}</Text>
                </Flex>
              </NavLink>
            </Tooltip>
          );
        })}
      </Flex>

      <Box p={4}>
        <Routes>
          <Route index element={<Navigate to="my-details" replace />} />
          <Route path="my-details" element={<Details />} />
          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<Password />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Settings;
