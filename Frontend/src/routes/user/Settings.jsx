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

// Placeholder content components
const MyDetails = () => <Text>My Details Content</Text>;
const Profile = () => <Text>Profile Content</Text>;
const Password = () => <Text>Password Content</Text>;
const Team = () => <Text>Team Content</Text>;
const Plan = () => <Text>Plan Content</Text>;
const Billing = () => <Text>Billing Content</Text>;
const Email = () => <Text>Email Content</Text>;
const Notifications = () => <Text>Notifications Content</Text>;

// Tabs with Material Design icons
const tabs = [
  { label: "My Details", path: "my-details", icon: MdPersonOutline },
  { label: "Password", path: "password", icon: MdLockOutline },
  { label: "Notifications", path: "notifications", icon: MdNotificationsNone },
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
          <Route path="my-details" element={<MyDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<Password />} />
          <Route path="team" element={<Team />} />
          <Route path="plan" element={<Plan />} />
          <Route path="billing" element={<Billing />} />
          <Route path="email" element={<Email />} />
          <Route path="notifications" element={<Notifications />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Settings;
