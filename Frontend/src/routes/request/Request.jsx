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
} from "@chakra-ui/react";
import {
  FaPlaneDeparture,
  FaClock,
  FaBuilding,
  FaUmbrellaBeach,
} from "react-icons/fa";
import Leave from "../../routes/request/Leave";
const Overtime = () => (
  <Box p={6}>
    <Heading fontSize="2xl" mb={3}>
      Overtime Request
    </Heading>
    <Text fontSize="md" color="gray.600">
      Request to log extra hours worked beyond your regular schedule.
    </Text>
  </Box>
);

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
            <Flex align="center" gap={2}>
              <Icon as={FaPlaneDeparture} />
              Leave
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
            <Flex align="center" gap={2}>
              <Icon as={FaClock} />
              Overtime
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
            <Flex align="center" gap={2}>
              <Icon as={FaBuilding} />
              Official Business
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
            <Flex align="center" gap={2}>
              <Icon as={FaUmbrellaBeach} />
              Day Off
            </Flex>
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
