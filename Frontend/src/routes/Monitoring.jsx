import React, { useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabData = [
    {
      label: "Daily Time Record",
      heading: "Daily Time Record",
      description:
        "View and manage individual daily time records here. This section provides a detailed breakdown of clock-in and clock-out times for each day, ensuring accurate attendance tracking.",
      content:
        "[Detailed table or list of daily entries will be displayed here, including Date, Clock-in, Clock-out, Break Times, and Total Hours worked.]",
    },
    {
      label: "DTR Range",
      heading: "Daily Time Record Range",
      description:
        "Generate and view comprehensive daily time records for a specified date range. This feature is essential for payroll processing, compliance, and generating summary reports for specific periods.",
      content:
        "[Interactive date range selector and aggregated data for the selected period, such as total hours, overtime, and absences.]",
    },
    {
      label: "DTR Calendar",
      heading: "Daily Time Record Calendar",
      description:
        "Visualize daily time records on an interactive calendar. This provides a quick overview of attendance patterns, highlights missed entries, and helps in identifying trends.",
      content:
        "[A dynamic calendar interface showcasing daily attendance status, holidays, and special events.]",
    },
    {
      label: "Raw In/Out Record",
      heading: "Raw In/Out Record",
      description:
        "Access the raw, unedited clock-in and clock-out data directly from the timekeeping system. This provides granular detail for auditing and troubleshooting any discrepancies.",
      content:
        "[Raw timestamp data, including Employee ID, exact Timestamp, recording Device, and Entry Type (In/Out).]",
    },
    {
      label: "Schedule Calendar",
      heading: "Schedule Calendar",
      description:
        "Manage and view employee work schedules on a comprehensive calendar. Easily assign shifts, track availability, and ensure optimal staffing levels for all operational periods.",
      content:
        "[An interactive calendar for managing and viewing detailed work schedules, including shift assignments and employee availability.]",
    },
  ];

  return (
    <Box
      bgGradient="linear(to-br, blue.50, indigo.100)"
      minH="100vh"
      p={{ base: 4, md: 8 }}
    >
      <VStack spacing={6} textAlign="center" mb={10}>
        <Heading fontSize={{ base: "3xl", md: "5xl" }} color="blue.800">
          Employee Monitoring Dashboard
        </Heading>
        <Text fontSize={{ base: "md", md: "xl" }} color="gray.600" maxW="2xl">
          Streamline your workforce management with intuitive time tracking and
          scheduling tools.
        </Text>
      </VStack>

      <Box
        bg="white"
        rounded="2xl"
        shadow="xl"
        maxW="7xl"
        mx="auto"
        borderWidth={1}
        borderColor="gray.200"
      >
        <Tabs
          isFitted
          variant="enclosed"
          index={activeTab}
          onChange={(index) => setActiveTab(index)}
          colorScheme="blue"
        >
          <TabList bg="blue.100" roundedTop="2xl">
            {tabData.map((tab, index) => (
              <Tab
                key={index}
                _selected={{
                  bg: "white",
                  color: "blue.800",
                  fontWeight: "bold",
                  borderBottom: "4px solid",
                  borderColor: "blue.600",
                }}
                _hover={{ bg: "blue.200" }}
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {tabData.map((tab, index) => (
              <TabPanel key={index} px={8} py={6} bg="white">
                <Heading fontSize="2xl" color="gray.800" mb={4}>
                  {tab.heading}
                </Heading>
                <Text fontSize="md" color="gray.700" mb={6}>
                  {tab.description}
                </Text>
                <Box
                  p={6}
                  bg="blue.50"
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600">
                    {tab.content}
                  </Text>
                </Box>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>

      <Text mt={16} textAlign="center" fontSize="sm" color="gray.500">
        &copy; {new Date().getFullYear()} Employee Monitoring. All rights
        reserved.
      </Text>
    </Box>
  );
};

export default Monitoring;
