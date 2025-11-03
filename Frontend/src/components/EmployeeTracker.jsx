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
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FaUser,
  FaUserMinus,
  FaCalendarAlt,
  FaFileAlt,
  FaCheck,
} from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
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
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

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

  const fetchWeeklyAttendance = async () => {
    setChartLoading(true);
    try {
      console.log("🔄 Fetching weekly attendance...");

      // Get Monday of current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      // Create weekday data structure (Monday to Friday)
      const weekData = {};
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

      for (let i = 0; i < 5; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(currentDate.getDate() + i);
        const dayName = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });
        weekData[dayName] = { "Full-time": 0, "Part-time": 0 };
      }

      // Fetch attendance for each weekday
      const response = await axiosInstance.get(
        "/attendanceRoutes/getweekly-attendance"
      );

      console.log("✅ API Response:", response.data);

      const { data, summary } = response.data;

      if (!data || data.length === 0) {
        console.warn("⚠️ No attendance data in response");
      }

      // Group attendance by day
      data.forEach((record) => {
        const date = new Date(record.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

        if (days.includes(dayName)) {
          const employmentType = record.employmentType || "Full-time";
          if (weekData[dayName]) {
            weekData[dayName][employmentType]++;
          }
        }
      });

      // Format chart data for display
      const formattedChartData = days.map((day) => ({
        day,
        "Full-time": weekData[day]["Full-time"] || 0,
        "Part-time": weekData[day]["Part-time"] || 0,
      }));

      console.log("📊 Formatted chart data:", formattedChartData);
      setChartData(formattedChartData);

      console.log("Weekly attendance loaded:", summary);
    } catch (error) {
      console.error(
        "❌ Error fetching weekly attendance:",
        error.response?.data || error.message
      );
      console.error("Full error:", error);

      // Set default empty chart data on error
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      setChartData(
        days.map((day) => ({
          day,
          "Full-time": 0,
          "Part-time": 0,
        }))
      );
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchWeeklyAttendance();
    // Optionally refresh attendance every 5 minutes
    const interval = setInterval(fetchWeeklyAttendance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedData = chartData.map((item) => ({
    ...item,
    day: isMobile ? shortLabels[item.day] || item.day : item.day,
  }));

  if (loading && chartData.length === 0) {
    return (
      <Center h="300px">
        <Spinner size="lg" color="teal.500" />
      </Center>
    );
  }

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

        {chartLoading && <Spinner size="lg" color="teal.500" />}

        {formattedData.length > 0 && (
          <ResponsiveBar
            data={formattedData}
            keys={["Full-time", "Part-time"]}
            indexBy="day"
            margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
            padding={0.4}
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
            ariaLabel="Daily Present Employees Chart"
            barAriaLabel={(e) =>
              `${e.id}: ${e.formattedValue} employees present`
            }
          />
        )}
      </Box>
    </Box>
  );
};

export default EmployeeTracker;
