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
  useMediaQuery,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaPlaneDeparture,
  FaClock,
  FaBuilding,
  FaUmbrellaBeach,
} from "react-icons/fa";
import Leave from "../../routes/request/Leave";
import Overtime from "./OvertimeAdmin";

const Request = () => {
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  const activeTabBg = useColorModeValue("teal.50", "teal.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Centralized tab config
  const tabConfig = [
    {
      label: "Leave",
      short: "Leave", // always full label
      icon: FaPlaneDeparture,
      component: <Leave />,
      alwaysFull: true, // force full label even on mobile
    },
    {
      label: "Overtime",
      short: "OT",
      icon: FaClock,
      component: <Overtime />,
    },
    {
      label: "Official Business",
      short: "OB",
      icon: FaBuilding,
      component: (
        <Box p={6}>
          <Heading fontSize="2xl" mb={3}>
            Official Business
          </Heading>
          <Text fontSize="md" color="gray.600">
            Use this section to request field work or official travel for
            business purposes.
          </Text>
        </Box>
      ),
    },
    {
      label: "Day Off",
      short: "DO",
      icon: FaUmbrellaBeach,
      component: (
        <Box p={6}>
          <Heading fontSize="2xl" mb={3}>
            Day Off
          </Heading>
          <Text fontSize="md" color="gray.600">
            Apply for your regular day off or schedule changes in advance.
          </Text>
        </Box>
      ),
    },
  ];

  // Render tab label with icon + tooltip logic
  const renderTabLabel = ({ icon, label, short, alwaysFull }) => (
    <Flex align="center" gap={2}>
      <Icon as={icon} />
      {isMobile && !alwaysFull ? (
        <Tooltip label={label} aria-label={label} placement="top">
          <Text>{short}</Text>
        </Tooltip>
      ) : (
        <Text>{label}</Text>
      )}
    </Flex>
  );

  return (
    <Box mt={10} bg="white" rounded="2xl" shadow="xl">
      <Tabs variant="unstyled" isFitted colorScheme="teal">
        {/* Tabs */}
        <TabList borderBottom="1px solid" borderColor={borderColor} mb={4}>
          {tabConfig.map((tab, idx) => (
            <Tab
              key={idx}
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
              {renderTabLabel(tab)}
            </Tab>
          ))}
        </TabList>

        {/* Tab Panels */}
        <TabPanels>
          {tabConfig.map((tab, idx) => (
            <TabPanel key={idx}>{tab.component}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Request;
