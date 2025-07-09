import React from "react";
import {
  ChakraProvider,
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FaUser, FaUserMinus, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { extendTheme } from "@chakra-ui/react"; // Not strictly needed for this fix, but good to keep if you plan to extend themes

// 1. Define the MetricCard component
const MetricCard = ({ title, value, percentageChange, type, icon }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const helpTextColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Stat
      p={5}
      shadow="sm"
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      rounded="md"
      bg={cardBg}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <StatLabel fontWeight="medium" isTruncated color={helpTextColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
            {value}
          </StatNumber>
        </Box>
        {icon && (
          <Icon as={icon} w={8} h={8} color="teal.500" fontSize={"xs"} /> // Using Chakra's Icon component with the passed icon prop
        )}
      </Flex>
      <StatHelpText>
        <StatArrow type={type} />
        <Text as="span" color={type === "increase" ? "green.500" : "red.500"}>
          {percentageChange}
        </Text>{" "}
        last month
      </StatHelpText>
    </Stat>
  );
};

// 2. Sample Data for the Bar Chart
const employeeTrackerData = [
  {
    day: "Monday",
    "Full-time": 50,
    "Part-time": 20,
  },
  {
    day: "Tuesday",
    "Full-time": 55,
    "Part-time": 22,
  },
  {
    day: "Wednesday",
    "Full-time": 48,
    "Part-time": 18,
  },
  {
    day: "Thursday",
    "Full-time": 60,
    "Part-time": 25,
  },
  {
    day: "Friday",
    "Full-time": 52,
    "Part-time": 21,
  },
  {
    day: "Saturday",
    "Full-time": 30,
    "Part-time": 15,
  },
  {
    day: "Sunday",
    "Full-time": 10,
    "Part-time": 5,
  },
];

const EmployeeTracker = () => {
  const chartBgColor = useColorModeValue("white", "gray.700");
  const chartBorderColor = useColorModeValue("gray.200", "gray.700");
  const chartTitleColor = useColorModeValue("gray.800", "white");

  return (
    // 3. Wrap the component in ChakraProvider

    <Box pt={4}>
      {" "}
      {/* Changed from 70% to 50% */}
      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <MetricCard
          title="New Employee"
          value="1012"
          percentageChange="30%"
          type="increase"
          icon={FaUser}
        />
        <MetricCard
          title="Resign Employee"
          value="102"
          percentageChange="22%"
          type="decrease"
          icon={FaUserMinus}
        />
        <MetricCard
          title="Employee on Leave"
          value="23"
          percentageChange="18%"
          type="increase"
          icon={FaCalendarAlt}
        />
        <MetricCard
          title="New Application"
          value="200"
          percentageChange="30%"
          type="decrease"
          icon={FaFileAlt}
        />
      </SimpleGrid>
      {/* Employee Tracker Bar Chart */}
      <Box
        height="350px"
        width="100%"
        p={4}
        background="black"
        shadow="sm"
        border="1px solid"
        borderColor={chartBorderColor}
        rounded="md"
        bg={chartBgColor}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Heading as="h2" size="md" color={chartTitleColor}>
            Employee Tracker
          </Heading>
          <Text fontSize="sm" color="gray.500">
            This week ▼
          </Text>
        </Flex>
        <ResponsiveBar
          data={employeeTrackerData} // Now `employeeTrackerData` is defined
          keys={["Full-time", "Part-time"]}
          indexBy="day"
          margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
          padding={0.25}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "set2" }}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 4,
            tickPadding: 4,
            legend: "Day",
            legendPosition: "middle",
            legendOffset: 28,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 4,
            tickPadding: 4,
            legend: "Count",
            legendPosition: "middle",
            legendOffset: -35,
            truncateTickAt: 0,
          }}
          labelSkipWidth={10}
          labelSkipHeight={10}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.4]],
          }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              translateX: 100,
              itemWidth: 80,
              itemHeight: 18,
              symbolSize: 16,
            },
          ]}
          role="application"
          ariaLabel="Employee Tracker Chart"
          barAriaLabel={(e) =>
            `${e.id}: ${e.formattedValue} in ${e.indexValue}`
          }
        />
      </Box>
    </Box>
  );
};

export default EmployeeTracker;
