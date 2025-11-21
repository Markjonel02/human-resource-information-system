import React, { useState, lazy, Suspense } from "react";
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
  Tooltip,
  Spinner,
  Center,
} from "@chakra-ui/react";

// Lazy load tab components
const DailyTimeRecord = lazy(() => import("./DailtyTimeRecord"));
const DTRRange = lazy(() => import("./DailyTimeRecordRange"));
const DTRCalendar = lazy(() => import("./DailtyTimeRecordCalendar"));
const RawInOutRecord = lazy(() => import("./DailtyTimeRecordInOut"));
const ScheduleCalendar = lazy(() => import("./ScheduleCalendar"));

const LoadingFallback = () => (
  <Center h="400px">
    <VStack spacing={4}>
      <Spinner size="xl" color="blue.500" thickness="4px" />
      <Text color="gray.600">Loading component...</Text>
    </VStack>
  </Center>
);

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabData = [
    {
      label: "Daily Time Record",
      component: DailyTimeRecord,
    },
    {
      label: "DTR Range",
      component: DTRRange,
    },
    {
      label: "DTR Calendar",
      component: DTRCalendar,
    },
    {
      label: "Raw In/Out Record",
      component: RawInOutRecord,
    },
    {
      label: "Schedule Calendar",
      component: ScheduleCalendar,
    },
  ];

  return (
    <Box
      bgGradient="linear(to-br, blue.50, indigo.100)"
      minH="100vh"
      fontFamily="Inter, sans-serif"
    >
      <VStack spacing={6} mb={10} pt={8} textAlign="left">
        <Heading fontSize={{ md: "2xl" }} color="blue.800">
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
              <Tooltip key={index} label={tab.label} hasArrow placement="top">
                <Tab
                  _selected={{
                    bg: "white",
                    color: "blue.800",
                    fontWeight: "bold",
                    borderBottom: "4px solid",
                    borderColor: "blue.600",
                  }}
                  _hover={{ bg: "blue.200" }}
                  borderRadius="md"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {tab.label}
                </Tab>
              </Tooltip>
            ))}
          </TabList>

          <TabPanels>
            {tabData.map((tab, index) => {
              const TabComponent = tab.component;
              return (
                <TabPanel key={index} p={0}>
                  <Suspense fallback={<LoadingFallback />}>
                    <TabComponent />
                  </Suspense>
                </TabPanel>
              );
            })}
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
