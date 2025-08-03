import { useEffect, useState } from "react";
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
  useBreakpointValue,
  Text,
  Icon,
} from "@chakra-ui/react";
import { FaUser, FaUserMinus, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { employeeTrackerData } from "../lib/api"; // Your data source
import { axiosInstance } from "../lib/axiosInstance";

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
      <Flex justify="space-between" align="center">
        <Box>
          <StatLabel fontWeight="medium" isTruncated color={helpTextColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
            {value}
          </StatNumber>
        </Box>
        {icon && (
          <Icon
            as={icon}
            w={{ base: 10, md: 10 }}
            h={7}
            color="teal.500"
            fontSize="xs"
            ml={{ base: 1, md: 0 }}
          />
        )}
      </Flex>
      <StatHelpText></StatHelpText>
    </Stat>
  );
};

const EmployeeTracker = () => {
  const chartBgColor = useColorModeValue("white", "gray.700");
  const chartBorderColor = useColorModeValue("gray.200", "gray.700");
  const chartTitleColor = useColorModeValue("gray.800", "white");
  const [metrics, setMetrics] = useState({
    current: {
      newEmployees: 0,
      inactiveEmployees: 0,
      onLeave: 0,
      total: 0,
    },
    previous: {
      newEmployees: 0,
      inactiveEmployees: 0,
      onLeave: 0,
      total: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState(0);
  const [allEmployee, setAllEmployee] = useState(0);
  const [employeeOnLeave, setEmployeeOnLeave] = useState(0);
  const [inactiveEmployee, setInactiveEmployee] = useState(0);

  const fetchingEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employees = response.data;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let newEmp = 0;
      let onLeave = 0;
      let inactive = 0;

      employees.forEach((emp) => {
        if (emp.CreatedAt && new Date(emp.CreatedAt) >= startOfMonth) {
          newEmp++;
        }

        if (emp.onLeave === true) {
          onLeave++;
        }

        if (emp.employeeStatus === 0) {
          inactive++;
        }
      });

      setNewEmployee(newEmp);
      setAllEmployee(employees.length);
      setEmployeeOnLeave(onLeave);
      setInactiveEmployee(inactive);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchingEmployees();
  }, []);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const axisBottomLabel = useBreakpointValue({
    md: "Day",
  });

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

  return (
    <Box pt={4}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2, xl: 4 }} spacing={4} mb={6}>
        <MetricCard title="New Employee" value={newEmployee} icon={FaUser} />
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

      {/* Rest of your component remains the same */}
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
