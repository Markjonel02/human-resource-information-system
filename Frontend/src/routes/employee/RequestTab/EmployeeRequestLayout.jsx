import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  useMediaQuery,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaPlaneDeparture,
  FaClock,
  FaBuilding,
  FaUmbrellaBeach,
} from "react-icons/fa";
import Leave from "./EmployeeLeave";
import Overtime from "./Overtime";
import EmployeeOfficialBusiness from "./EmployeeOfficialBusiness";

const DayOff = () => (
  <Box p={6}>
    <Heading fontSize="2xl" mb={3}>
      Day Off
    </Heading>
    <Text fontSize="md" color="gray.600">
      Apply for your regular day off or schedule changes in advance.
    </Text>
  </Box>
);

const EmployeeRequestLayout = () => {
  const tabBg = useColorModeValue("gray.100", "gray.700");
  const activeTabBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [tabIndex, setTabIndex] = useState(0);

  // Load saved tab index from localStorage
  useEffect(() => {
    const savedIndex = localStorage.getItem("employeeRequestTab");
    if (savedIndex !== null) {
      setTabIndex(Number(savedIndex));
    }
  }, []);

  // Save tab index when user changes tab
  const handleTabChange = (index) => {
    setTabIndex(index);
    localStorage.setItem("employeeRequestTab", index);
  };

  const renderTabContent = (icon, fullText, mobileText) => (
    <Flex align="center" gap={2}>
      <Icon as={icon} />
      {isMobile ? (
        <Tooltip label={fullText} aria-label={fullText} placement="top">
          <Text>{mobileText}</Text>
        </Tooltip>
      ) : (
        <Text>{fullText}</Text>
      )}
    </Flex>
  );

  return (
    <Box mt={10} bg="white" rounded="2xl" shadow="xl">
      <Tabs
        variant="unstyled"
        isFitted
        colorScheme="blue"
        index={tabIndex}
        onChange={handleTabChange}
      >
        <TabList borderBottom="1px solid" borderColor={borderColor} mb={4}>
          <Tab
            _selected={{
              color: "blue.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "blue.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            <Flex align="center" gap={2}>
              <Icon as={FaPlaneDeparture} />
              <Text>Leave</Text>
            </Flex>
          </Tab>
          <Tab
            _selected={{
              color: "blue.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "blue.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {renderTabContent(FaClock, "Overtime", "OT")}
          </Tab>
          <Tab
            _selected={{
              color: "blue.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "blue.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {renderTabContent(FaBuilding, "Official Business", "OB")}
          </Tab>
          <Tab
            _selected={{
              color: "blue.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "blue.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {renderTabContent(FaUmbrellaBeach, "Day Off", "DO")}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Leave />
          </TabPanel>
          <TabPanel>
            <Overtime />
          </TabPanel>
          <TabPanel>
            <EmployeeOfficialBusiness />
          </TabPanel>
          <TabPanel>
            <DayOff />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default EmployeeRequestLayout;
