import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Icon,
  Text,
} from "@chakra-ui/react";
import { FaUser, FaUserMinus, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { employeeTrackerData } from "../lib/api";
import axiosInstance from "../lib/axiosInstance";

const MetricCard = ({ title, value, icon }) => {
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
      <Flex justify="space-between" align="center">
        <Box>
          <StatLabel fontWeight="medium" isTruncated color={helpTextColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
            {value}
          </StatNumber>
        </Box>
        {icon && <Icon as={icon} w={10} h={7} color="teal.500" ml={1} />}
      </Flex>
      <StatHelpText />
    </Stat>
  );
};

const EmployeeTracker = () => {
  const [loading, setLoading] = useState(false);
  const [allEmployee, setAllEmployee] = useState(0);
  const [TotalAdmin, setTotalAdmin] = useState(0);
  const [employeeOnLeave, setEmployeeOnLeave] = useState(0);
  const [inactiveEmployee, setInactiveEmployee] = useState(0);

  const chartBgColor = useColorModeValue("white", "gray.700");
  const chartBorderColor = useColorModeValue("gray.200", "gray.700");
  const chartTitleColor = useColorModeValue("gray.800", "white");

  const isMobile = useBreakpointValue({ base: true, md: false });

  const shortLabels = {
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "Th",
    Friday: "F",
    Saturday: "Sa",
    Sunday: "Su",
  };

  const formattedData = employeeTrackerData.map((item) => ({
    ...item,
    day: isMobile ? shortLabels[item.day] || item.day : item.day,
  }));

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/employees");
      const employees = response.data;

      const totalAdmin = employees.filter(
        (emp) => emp.role === "admin" && emp.employeeStatus !== 0
      ).length;

      let onLeave = 0;
      let inactive = 0;

      employees.forEach((emp) => {
        if (emp.onLeave) onLeave++;
        if (emp.employeeStatus === 0) inactive++;
      });

      setTotalAdmin(totalAdmin);
      setAllEmployee(employees.length - inactive);
      setEmployeeOnLeave(onLeave);
      setInactiveEmployee(inactive);
    } catch (error) {
      console.error(
        "❌ Error fetching employees:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Box pt={4}>
      <SimpleGrid columns={{ base: 2, md: 2, lg: 2, xl: 4 }} spacing={4} mb={6}>
        <MetricCard title="Total Admin" value={TotalAdmin} icon={FaUser} />
        <MetricCard
          title="Resign Employee"
          value={inactiveEmployee}
          icon={FaUserMinus}
        />
        <MetricCard
          title="Employee on Leave"
          value={employeeOnLeave}
          icon={FaCalendarAlt}
        />
        <MetricCard
          title="Total Employees"
          value={allEmployee}
          icon={FaFileAlt}
        />
      </SimpleGrid>

      <Box
        height="350px"
        width="100%"
        p={4}
        shadow="sm"
        border="1px solid"
        borderColor={chartBorderColor}
        rounded="md"
        bg={chartBgColor}
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Heading as="h2" size="md" color={chartTitleColor}>
            Employee Tracker
          </Heading>
          <Text fontSize="sm" color="gray.500">
            This week ▼
          </Text>
        </Flex>

        <ResponsiveBar
          data={formattedData}
          keys={["Full-time", "Part-time"]}
          indexBy="day"
          margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
          padding={0.25}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "set2" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 4,
            tickPadding: 4,
            legendPosition: "middle",
            legendOffset: 28,
          }}
          axisLeft={{
            tickSize: 4,
            tickPadding: 4,
            legend: "Count",
            legendPosition: "middle",
            legendOffset: -35,
          }}
          labelSkipWidth={10}
          labelSkipHeight={10}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.4]] }}
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
