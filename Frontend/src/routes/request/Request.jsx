import React from "react";
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
  useMediaQuery, // Import useMediaQuery
  Tooltip, // Import Tooltip
} from "@chakra-ui/react";
import {
  FaPlaneDeparture,
  FaClock,
  FaBuilding,
  FaUmbrellaBeach,
} from "react-icons/fa";
import Leave from "../../routes/request/Leave";
import Overtime from "../../routes/request/Overtime";

const OfficialBusiness = () => (
  <Box p={6}>
    <Heading fontSize="2xl" mb={3}>
      Official Business
    </Heading>
    <Text fontSize="md" color="gray.600">
      Use this section to request field work or official travel for business
      purposes.
    </Text>
  </Box>
);

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

const Request = () => {
  const tabBg = useColorModeValue("gray.100", "gray.700");
  const activeTabBg = useColorModeValue("teal.50", "teal.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Use useMediaQuery to check for mobile screen size (e.g., less than 48em which is 'md' breakpoint)
  const [isMobile] = useMediaQuery("(max-width: 48em)"); // Chakra UI's 'md' breakpoint

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
      <Tabs variant="unstyled" isFitted colorScheme="teal">
        <TabList borderBottom="1px solid" borderColor={borderColor} mb={4}>
          <Tab
            _selected={{
              color: "teal.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "teal.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {/* Leave tab - no truncation */}
            <Flex align="center" gap={2}>
              <Icon as={FaPlaneDeparture} />
              <Text>Leave</Text>
            </Flex>
          </Tab>
          <Tab
            _selected={{
              color: "teal.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "teal.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {renderTabContent(FaClock, "Overtime", "OT")}
          </Tab>
          <Tab
            _selected={{
              color: "teal.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "teal.400",
            }}
            py={4}
            transition="all 0.3s"
          >
            {renderTabContent(FaBuilding, "Official Business", "OB")}
          </Tab>
          <Tab
            _selected={{
              color: "teal.600",
              bg: activeTabBg,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "teal.400",
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
            <OfficialBusiness />
          </TabPanel>
          <TabPanel>
            <DayOff />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Request;
