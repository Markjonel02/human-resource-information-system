import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Avatar,
  Divider,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  ModalCloseButton,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Textarea,
  Badge,
  Progress,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  WarningIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import {
  FaUserTie,
  FaBriefcase,
  FaFileAlt,
  FaClock,
  FaHistory,
  FaExclamationTriangle,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";

// Mock axios instance for demo
const axiosInstance = {
  get: async (url, config) => {
    // Mock API responses
    if (url === "/employees") {
      return {
        data: [
          {
            _id: "1",
            firstname: "John",
            lastname: "Doe",
            employeeId: "EMP001",
            role: "Developer",
            department: "IT",
          },
          {
            _id: "2",
            firstname: "Jane",
            lastname: "Smith",
            employeeId: "EMP002",
            role: "Designer",
            department: "Design",
          },
          {
            _id: "3",
            firstname: "Mike",
            lastname: "Johnson",
            employeeId: "EMP003",
            role: "Manager",
            department: "Operations",
          },
        ],
      };
    }
    if (url === "/attendance") {
      return { data: mockAttendanceData };
    }
    if (url.includes("/attendance/employee/") && url.includes("/today")) {
      return {
        data: {
          hasCheckedIn: false,
          hasCheckedOut: false,
          canCheckIn: true,
          canCheckOut: false,
          attendance: null,
        },
      };
    }
    if (url.includes("/attendance/employee/")) {
      return { data: { attendance: mockAttendanceData, summary: mockSummary } };
    }
    if (url === "/attendance/stats") {
      return { data: mockStats };
    }
    return { data: [] };
  },
  post: async (url, data) => {
    if (url === "/attendance/check-in") {
      return {
        data: {
          message: "Check-in successful",
          attendance: {
            ...data,
            _id: Date.now().toString(),
            checkIn: new Date(),
          },
          checkInTime: new Date().toLocaleTimeString(),
        },
      };
    }
    if (url === "/attendance/check-out") {
      return {
        data: {
          message: "Check-out successful",
          attendance: {
            ...data,
            _id: Date.now().toString(),
            checkOut: new Date(),
          },
          checkOutTime: new Date().toLocaleTimeString(),
          hoursRendered: "8h 30m",
        },
      };
    }
    return { data: { attendance: { ...data, _id: Date.now().toString() } } };
  },
  put: async (url, data) => ({ data }),
  delete: async (url) => ({ data: {} }),
};

// Mock data - focused on check-in/checkout only
const mockAttendanceData = [
  {
    _id: "1",
    employee: {
      _id: "1",
      firstname: "John",
      lastname: "Doe",
      employeeId: "EMP001",
      role: "Developer",
      department: "IT",
    },
    date: "2024-08-18",
    status: "present",
    checkIn: new Date("2024-08-18T08:15:00"),
    checkOut: new Date("2024-08-18T17:30:00"),
    hoursRendered: 495, // 8h 15m in minutes
    tardinessMinutes: 15,
    notes: "Normal working day",
  },
  {
    _id: "2",
    employee: {
      _id: "2",
      firstname: "Jane",
      lastname: "Smith",
      employeeId: "EMP002",
      role: "Designer",
      department: "Design",
    },
    date: "2024-08-18",
    status: "late",
    checkIn: new Date("2024-08-18T08:45:00"),
    checkOut: new Date("2024-08-18T17:15:00"),
    hoursRendered: 510, // 8h 30m in minutes
    tardinessMinutes: 45,
    notes: "Traffic delay",
  },
  {
    _id: "3",
    employee: {
      _id: "3",
      firstname: "Mike",
      lastname: "Johnson",
      employeeId: "EMP003",
      role: "Manager",
      department: "Operations",
    },
    date: "2024-08-18",
    status: "present",
    checkIn: new Date("2024-08-18T07:55:00"),
    checkOut: null, // Still at work
    hoursRendered: 0,
    tardinessMinutes: 0,
    notes: "Early arrival",
  },
];

const mockSummary = {
  totalDays: 30,
  presentDays: 22,
  lateDays: 5,
  absentDays: 2,
  leaveDays: 1,
  totalHoursRendered: 12600, // in minutes
  totalTardinessMinutes: 180,
};

const mockStats = {
  today: [
    { _id: "present", count: 15, totalTardiness: 30, totalHours: 7200 },
    { _id: "late", count: 3, totalTardiness: 90, totalHours: 1440 },
    { _id: "absent", count: 2, totalTardiness: 0, totalHours: 0 },
  ],
  monthly: [
    { _id: "present", count: 450, totalTardiness: 600, totalHours: 216000 },
    { _id: "late", count: 85, totalTardiness: 2550, totalHours: 40800 },
    { _id: "absent", count: 25, totalTardiness: 0, totalHours: 0 },
  ],
  leaveBreakdown: { VL: 8, SL: 6, LWOP: 5, BL: 5, OS: 7, CL: 5 },
};

const mockCheckInOutLogs = [
  {
    employeeId: "1",
    action: "Check In",
    timestamp: "2024-08-18T08:15:00Z",
    description: "Employee checked in at main entrance",
    location: "Main Entrance",
  },
  {
    employeeId: "1",
    action: "Check Out",
    timestamp: "2024-08-18T17:30:00Z",
    description: "Employee checked out at main entrance",
    location: "Main Entrance",
  },
  {
    employeeId: "2",
    action: "Check In",
    timestamp: "2024-08-18T08:45:00Z",
    description: "Late check-in due to traffic",
    location: "Main Entrance",
  },
];

// Helper functions
const parseTimeToMinutes = (timeStr) => {
  // Ensure we have a string to work with
  if (typeof timeStr !== "string") {
    timeStr = String(timeStr || "");
  }

  timeStr = timeStr.trim();
  if (!timeStr || timeStr === "-" || timeStr === "") return null;

  try {
    const [time, period] = timeStr.split(" ");
    if (!time) return null;

    let [hours, minutes] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  } catch (error) {
    console.warn("Error parsing time:", timeStr, error);
    return null;
  }
};
const formatLogTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const minutesToTimeString = (minutes) => {
  if (minutes === null || isNaN(minutes)) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")} ${period}`;
};

const shouldBeMarkedAsLate = (checkInTime, standardCheckIn = "08:00 AM") => {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const standardMinutes = parseTimeToMinutes(standardCheckIn);
  if (checkInMinutes === null || standardMinutes === null) return false;
  return checkInMinutes > standardMinutes;
};

const calculateLateMinutes = (checkInTime, standardCheckIn = "08:00 AM") => {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const standardMinutes = parseTimeToMinutes(standardCheckIn);
  if (checkInMinutes === null || standardMinutes === null) return 0;
  return Math.max(0, checkInMinutes - standardMinutes);
};

const EmployeeAttendanceTracker = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [todayStatus, setTodayStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    canCheckIn: true,
    canCheckOut: false,
    attendance: null,
  });

  // Check-in/Check-out states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentEmployee] = useState({
    _id: "1",
    firstname: "John",
    lastname: "Doe",
    employeeId: "EMP001",
  });

  const [companySettings] = useState({
    standardCheckIn: "08:00 AM",
    standardCheckOut: "05:00 PM",
  });

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [selectedEmployee, setSelectedEmployee] = useState({
    employee: {},
    date: "",
    status: "",
    checkIn: null,
    checkOut: null,
    // other default fields
  });
  const toast = useToast();

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch attendance records and today's status
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);

        // Fetch all attendance records
        const response = await axiosInstance.get("/attendance");
        setAttendanceRecords(response.data);

        // Fetch today's status for current employee
        const todayResponse = await axiosInstance.get(
          `/attendance/employee/${currentEmployee._id}/today`
        );
        setTodayStatus(todayResponse.data);

        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [refreshKey, currentEmployee._id]);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);

      const response = await axiosInstance.post("/attendance/check-in", {
        employeeId: currentEmployee._id,
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: response.data.message.includes("late") ? "warning" : "success",
        duration: 3000,
        isClosable: true,
      });

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to check in",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);

      const response = await axiosInstance.post("/attendance/check-out", {
        employeeId: currentEmployee._id,
      });

      toast({
        title: "Success",
        description: `${response.data.message} - Total hours: ${response.data.hoursRendered}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to check out",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      if (!searchTerm) return true;

      const employeeName = `${record.employee?.firstname || ""} ${
        record.employee?.lastname || ""
      }`.toLowerCase();
      const employeeId = record.employee?.employeeId?.toLowerCase() || "";
      const status = record.status.toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        employeeName.includes(search) ||
        employeeId.includes(search) ||
        status.includes(search)
      );
    });
  }, [searchTerm, attendanceRecords]);

  const {
    totalMinLate,
    numLate,
    numAbsent,
    numPresent,
    leaveCounts,
    absentEmployees,
  } = useMemo(() => {
    let totalMinLate = 0;
    let numLate = 0;
    let numAbsent = 0;
    let numPresent = 0;
    // Ensure minimum 5 for each leave type
    const leaveCounts = { VL: 5, SL: 5, LWOP: 5, BL: 5, OS: 5, CL: 5 };
    const absentEmployees = [];

    filteredAttendance.forEach((record) => {
      const normalizedStatus = record.status.toLowerCase();

      if (normalizedStatus === "late") {
        numLate++;
        if (record.checkIn) {
          const lateMinutes = calculateLateMinutes(
            record.checkIn,
            companySettings.standardCheckIn
          );
          totalMinLate += lateMinutes;
        }
      } else if (normalizedStatus === "absent") {
        numAbsent++;
        absentEmployees.push(record);
      } else if (normalizedStatus === "present") {
        numPresent++;
      } else if (
        (normalizedStatus === "leave" || normalizedStatus === "on_leave") &&
        record.leaveType
      ) {
        if (leaveCounts.hasOwnProperty(record.leaveType)) {
          leaveCounts[record.leaveType]++;
        }
      }
    });

    return {
      totalMinLate,
      numLate,
      numAbsent,
      numPresent,
      leaveCounts,
      absentEmployees,
    };
  }, [filteredAttendance, companySettings.standardCheckIn]);

  const getStatusColorScheme = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "orange";
      case "leave":
      case "on_leave":
        return "blue";
      default:
        return "gray";
    }
  };

  const calculateHoursRendered = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);

    if (checkOutTime <= checkInTime) return "-";

    const totalMinutes = Math.floor((checkOutTime - checkInTime) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTardiness = (record) => {
    if (record.tardinessMinutes && record.tardinessMinutes > 0) {
      return `${record.tardinessMinutes} min late`;
    }
    return "-";
  };

  const handleViewDetails = async (employee) => {
    try {
      // Set basic employee info first
      setSelectedEmployee({
        ...employee,
        employee: employee.employee || {},
      });

      const logsResponse = await axiosInstance.get(
        `/attendance/employee/${employee.employee._id}`
      );
      setAttendanceLogs(logsResponse.data.attendance || []);
      onDrawerOpen();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const capitalizeStatus = (status) => {
    if (status.toLowerCase() === "on_leave") return "Leave";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getAttendanceRate = () => {
    const total = filteredAttendance.length;
    if (total === 0) return 0;
    return Math.round((numPresent / total) * 100);
  };

  return (
    <Box
      minH="100vh"
      p={{ base: 4, sm: 6, lg: 8 }}
      bg="gray.50"
      fontFamily="sans-serif"
    >
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          bg="blackAlpha.300"
        >
          <Box bg="white" p={6} borderRadius="lg" shadow="lg">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text fontSize="lg" color="gray.600">
                Loading...
              </Text>
            </VStack>
          </Box>
        </Flex>
      )}

      {error && (
        <Alert status="error" mb={4} borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={6}
      >
        <VStack align="flex-start" mb={{ base: 4, md: 0 }}>
          <Heading
            as="h1"
            fontSize={{ base: "2xl", sm: "3xl" }}
            fontWeight="bold"
            color="gray.800"
          >
            Employee Attendance
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Welcome, {currentEmployee.firstname} {currentEmployee.lastname}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Last updated: {new Date().toLocaleString()}
          </Text>
        </VStack>
        <HStack
          spacing={4}
          direction={{ base: "column", sm: "row" }}
          w={{ base: "full", md: "auto" }}
        >
          <Button
            leftIcon={<FaSignInAlt />}
            colorScheme="green"
            onClick={handleCheckIn}
            isLoading={isCheckingIn}
            isDisabled={!todayStatus.canCheckIn}
            loadingText="Checking In..."
            size={{ base: "sm", md: "md" }}
          >
            {todayStatus.hasCheckedIn ? "Already Checked In" : "Check In"}
          </Button>
          <Button
            leftIcon={<FaSignOutAlt />}
            colorScheme="red"
            onClick={handleCheckOut}
            isLoading={isCheckingOut}
            isDisabled={!todayStatus.canCheckOut}
            loadingText="Checking Out..."
            size={{ base: "sm", md: "md" }}
          >
            {todayStatus.hasCheckedOut ? "Already Checked Out" : "Check Out"}
          </Button>
          <InputGroup w={{ base: "full", sm: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search employee or status"
              pl={10}
              pr={4}
              py={2}
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="lg"
              focusBorderColor="blue.500"
              _focus={{ boxShadow: "outline" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </HStack>
      </Flex>

      {/* Enhanced Statistics Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card borderLeft="4px" borderColor="green.400">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">
                Attendance Rate
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                {getAttendanceRate()}%
              </StatNumber>
              <StatHelpText color="gray.500">
                <StatArrow type="increase" />
                {numPresent} present today
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px" borderColor="orange.400">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">
                Total Late Time
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.600">
                {Math.floor(totalMinLate / 60)}h {totalMinLate % 60}m
              </StatNumber>
              <StatHelpText color="gray.500">
                <StatArrow type={numLate > 0 ? "decrease" : "increase"} />
                {numLate} late entries
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px" borderColor="red.400">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">
                Absences
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="red.600">
                {numAbsent}
              </StatNumber>
              <StatHelpText color="gray.500">
                <StatArrow type={numAbsent > 0 ? "decrease" : "increase"} />
                employees absent
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px" borderColor="blue.400">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">
                On Leave
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                {Object.values(leaveCounts).reduce((a, b) => a + b, 0)}
              </StatNumber>
              <StatHelpText color="gray.500">
                Total leave applications
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Leave Breakdown with minimum 5 for each */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md" color="gray.700">
            Leave Breakdown (Minimum 5 per category)
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
            {Object.entries(leaveCounts).map(([type, count]) => (
              <VStack key={type} bg="blue.50" p={3} borderRadius="md">
                <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                  {type}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.700">
                  {count}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Absent Employees Alert */}
      {absentEmployees.length > 0 && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          <VStack align="flex-start" spacing={2}>
            <Text fontWeight="semibold">
              {absentEmployees.length} employee(s) absent today:
            </Text>
            <HStack wrap="wrap" spacing={2}>
              {absentEmployees.map((record) => (
                <Tag key={record._id} colorScheme="red" size="sm">
                  {record.employee?.firstname} {record.employee?.lastname}
                </Tag>
              ))}
            </HStack>
          </VStack>
        </Alert>
      )}

      {/* Attendance Table */}
      <Card overflowX="auto">
        <Table variant="simple" minW="full">
          <Thead bg="gray.50">
            <Tr>
              <Th py={3} px={4}>
                Employee
              </Th>
              <Th py={3} px={4} display={{ base: "none", md: "table-cell" }}>
                Date
              </Th>
              <Th py={3} px={4}>
                Status
              </Th>
              <Th py={3} px={4} display={{ base: "none", lg: "table-cell" }}>
                Check-in
              </Th>
              <Th py={3} px={4} display={{ base: "none", lg: "table-cell" }}>
                Check-out
              </Th>
              <Th py={3} px={4} display={{ base: "none", xl: "table-cell" }}>
                Hours
              </Th>
              <Th py={3} px={4} display={{ base: "none", xl: "table-cell" }}>
                Leave Type
              </Th>
              <Th py={3} px={4} textAlign="right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAttendance.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={8}>
                  <VStack spacing={3}>
                    <Icon as={InfoIcon} w={8} h={8} color="gray.400" />
                    <Text color="gray.500">No attendance records found</Text>
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredAttendance.map((record) => (
                <Tr key={record._id} _hover={{ bg: "gray.50" }}>
                  <Td px={4} py={4}>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={`${record.employee?.firstname || "N/A"} ${
                          record.employee?.lastname || ""
                        }`}
                        bg="blue.500"
                        color="white"
                      />
                      <VStack align="flex-start" spacing={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                        >
                          {record.employee?.firstname || "N/A"}{" "}
                          {record.employee?.lastname || ""}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {record.employee?.employeeId || "N/A"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", md: "table-cell" }}
                  >
                    <HStack spacing={1}>
                      <CalendarIcon w={3} h={3} color="gray.500" />
                      <Text fontSize="sm" color="gray.900">
                        {formatDate(record.date)}
                      </Text>
                    </HStack>
                  </Td>
                  <Td px={4} py={4}>
                    <VStack align="flex-start" spacing={1}>
                      <Tag
                        size="sm"
                        variant="subtle"
                        colorScheme={getStatusColorScheme(record.status)}
                      >
                        {capitalizeStatus(record.status)}
                      </Tag>
                      {getTardiness(record) !== "-" && (
                        <Text
                          fontSize="xs"
                          color="orange.600"
                          fontWeight="medium"
                        >
                          {getTardiness(record)}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    <HStack spacing={1}>
                      <TimeIcon w={3} h={3} color="gray.500" />
                      <Text fontSize="md" fontWeight="bold" color="green.700">
                        {selectedEmployee.checkIn
                          ? formatTime(selectedEmployee.checkIn)
                          : "-"}
                      </Text>
                    </HStack>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    <HStack spacing={1}>
                      <TimeIcon w={3} h={3} color="gray.500" />
                      <Text fontSize="sm" color="gray.900">
                        {record.checkOut ? formatTime(record.checkOut) : "-"}
                      </Text>
                    </HStack>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", xl: "table-cell" }}
                  >
                    <Text fontSize="sm" color="gray.900" fontWeight="medium">
                      {calculateHoursRendered(record.checkIn, record.checkOut)}
                    </Text>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", xl: "table-cell" }}
                  >
                    {record.leaveType ? (
                      <Tag size="sm" colorScheme="blue" variant="outline">
                        {record.leaveType}
                      </Tag>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                    )}
                  </Td>
                  <Td px={4} py={4} textAlign="right">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem onClick={() => handleViewDetails(record)}>
                          View Details
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Enhanced Employee Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size={{ base: "full", md: "lg" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            bg="gradient-to-r"
            bgGradient="linear(to-r, blue.500, purple.600)"
            color="white"
            fontSize="lg"
            fontWeight="bold"
          >
            <HStack spacing={3}>
              <Icon as={FaUserTie} />
              <Text>Employee Attendance Details</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            {selectedEmployee && (
              <VStack align="stretch" spacing={0}>
                {/* Employee Header */}
                <Box
                  bg="gradient-to-r"
                  bgGradient="linear(to-r, blue.50, purple.50)"
                  p={6}
                >
                  <HStack spacing={4} mb={4}>
                    <Avatar
                      size="xl"
                      name={`${selectedEmployee.employee?.firstname || ""} ${
                        selectedEmployee.employee?.lastname || ""
                      }`}
                      bg="gradient-to-r"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      color="white"
                    />
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color="gray.800">
                        {selectedEmployee.employee?.firstname || "N/A"}{" "}
                        {selectedEmployee.employee?.lastname || ""}
                      </Text>
                      <Badge colorScheme="blue" fontSize="sm">
                        {selectedEmployee.employee?.employeeId || "N/A"}
                      </Badge>
                      <Text fontSize="md" color="gray.600">
                        {selectedEmployee.employee?.role || "N/A"} •{" "}
                        {selectedEmployee.employee?.department || "N/A"}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Status Badge */}
                  <HStack justify="center">
                    <Tag
                      size="lg"
                      variant="subtle"
                      colorScheme={getStatusColorScheme(
                        selectedEmployee.status
                      )}
                      px={4}
                      py={2}
                    >
                      <Icon
                        as={
                          selectedEmployee.status.toLowerCase() === "present"
                            ? CheckCircleIcon
                            : selectedEmployee.status.toLowerCase() === "late"
                            ? WarningIcon
                            : selectedEmployee.status.toLowerCase() === "absent"
                            ? FaExclamationTriangle
                            : InfoIcon
                        }
                        mr={2}
                      />
                      {capitalizeStatus(selectedEmployee.status)}
                    </Tag>
                  </HStack>
                </Box>

                {/* Tabs for different sections */}
                <Tabs>
                  <TabList bg="gray.50">
                    <Tab>Today's Record</Tab>
                    <Tab>Check-in/out Logs</Tab>
                    <Tab>Employee Info</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Today's Record Tab */}
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box
                          bg="white"
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor="gray.200"
                        >
                          <Heading size="sm" mb={3} color="gray.700">
                            <HStack>
                              <Icon as={CalendarIcon} color="blue.500" />
                              <Text>Attendance Details</Text>
                            </HStack>
                          </Heading>
                          <SimpleGrid columns={2} spacing={4}>
                            <Box>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                textTransform="uppercase"
                                letterSpacing="wide"
                                mb={1}
                              >
                                Date
                              </Text>
                              <Text
                                fontSize="md"
                                fontWeight="semibold"
                                color="gray.800"
                              >
                                {formatDate(selectedEmployee.date)}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                textTransform="uppercase"
                                letterSpacing="wide"
                                mb={1}
                              >
                                Status
                              </Text>
                              <Tag
                                size="sm"
                                colorScheme={getStatusColorScheme(
                                  selectedEmployee.status
                                )}
                              >
                                {capitalizeStatus(selectedEmployee.status)}
                              </Tag>
                            </Box>
                          </SimpleGrid>
                        </Box>

                        {selectedEmployee.checkIn && (
                          <Box
                            bg="green.50"
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor="green.200"
                          >
                            <Heading size="sm" mb={3} color="green.700">
                              <HStack>
                                <Icon as={TimeIcon} color="green.500" />
                                <Text>Time Records</Text>
                              </HStack>
                            </Heading>
                            <SimpleGrid columns={1} spacing={3}>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                  Check-in:
                                </Text>
                                <Text
                                  fontSize="md"
                                  fontWeight="bold"
                                  color="green.700"
                                >
                                  {selectedEmployee.checkIn}
                                </Text>
                              </HStack>
                              {selectedEmployee.checkOut &&
                                selectedEmployee.checkOut !== "-" && (
                                  <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">
                                      Check-out:
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      color="green.700"
                                    >
                                      {selectedEmployee.checkOut}
                                    </Text>
                                  </HStack>
                                )}
                              <Divider />
                              <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                  Hours Worked:
                                </Text>
                                <Text
                                  fontSize="md"
                                  fontWeight="bold"
                                  color="blue.700"
                                >
                                  {calculateHoursRendered(
                                    selectedEmployee.checkIn,
                                    selectedEmployee.checkOut
                                  )}
                                </Text>
                              </HStack>
                              {getTardiness(selectedEmployee) !== "-" && (
                                <HStack justify="space-between">
                                  <Text fontSize="sm" color="gray.600">
                                    Tardiness:
                                  </Text>
                                  <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    {getTardiness(selectedEmployee)}
                                  </Text>
                                </HStack>
                              )}
                            </SimpleGrid>
                          </Box>
                        )}

                        {selectedEmployee.leaveType && (
                          <Box
                            bg="blue.50"
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor="blue.200"
                          >
                            <Heading size="sm" mb={2} color="blue.700">
                              Leave Information
                            </Heading>
                            <Tag size="lg" colorScheme="blue" variant="subtle">
                              {selectedEmployee.leaveType}
                            </Tag>
                          </Box>
                        )}

                        {selectedEmployee.notes && (
                          <Box
                            bg="yellow.50"
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor="yellow.200"
                          >
                            <Heading size="sm" mb={2} color="yellow.800">
                              <HStack>
                                <Icon as={FaFileAlt} color="yellow.600" />
                                <Text>Notes</Text>
                              </HStack>
                            </Heading>
                            <Text
                              fontSize="sm"
                              color="gray.700"
                              lineHeight="tall"
                            >
                              {selectedEmployee.notes}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Check-in/out Logs Tab */}
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="sm" color="gray.700">
                          <HStack>
                            <Icon as={FaClock} color="indigo.500" />
                            <Text>Check-in/Check-out Activity</Text>
                          </HStack>
                        </Heading>

                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <VStack align="flex-start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              Real-time Tracking Active
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              All check-in and check-out activities are logged
                              automatically
                            </Text>
                          </VStack>
                        </Alert>

                        {/* Today's Check-in/out Summary */}
                        <Box
                          bg="gradient-to-r"
                          bgGradient="linear(to-r, green.50, blue.50)"
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor="green.200"
                        >
                          <Heading size="sm" mb={3} color="gray.700">
                            Today's Activity Summary
                          </Heading>
                          <SimpleGrid columns={2} spacing={4}>
                            <VStack align="center" spacing={2}>
                              <Icon
                                as={FaSignInAlt}
                                w={6}
                                h={6}
                                color="green.500"
                              />
                              <Text fontSize="xs" color="gray.600">
                                Check-in Time
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="green.600"
                              >
                                {selectedEmployee.checkIn || "Not yet"}
                              </Text>
                            </VStack>
                            <VStack align="center" spacing={2}>
                              <Icon
                                as={FaSignOutAlt}
                                w={6}
                                h={6}
                                color="red.500"
                              />
                              <Text fontSize="xs" color="gray.600">
                                Check-out Time
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="red.600"
                              >
                                {selectedEmployee.checkOut || "Not yet"}
                              </Text>
                            </VStack>
                          </SimpleGrid>
                        </Box>

                        {/* Activity Logs */}
                        {attendanceLogs.length > 0 ? (
                          <VStack align="stretch" spacing={2}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.700"
                            >
                              Recent Activity Logs
                            </Text>
                            {attendanceLogs
                              .filter(
                                (log) =>
                                  log.employeeId ===
                                  selectedEmployee.employee?._id
                              )
                              .slice(0, 10)
                              .map((log, index) => (
                                <Box
                                  key={index}
                                  bg="white"
                                  p={4}
                                  borderRadius="md"
                                  border="1px"
                                  borderColor="gray.200"
                                  position="relative"
                                >
                                  <HStack justify="space-between" mb={2}>
                                    <HStack spacing={3}>
                                      <Icon
                                        as={
                                          log.action === "Check In"
                                            ? FaSignInAlt
                                            : FaSignOutAlt
                                        }
                                        color={
                                          log.action === "Check In"
                                            ? "green.500"
                                            : "red.500"
                                        }
                                        w={4}
                                        h={4}
                                      />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        color="gray.800"
                                      >
                                        {log.action}
                                      </Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={
                                        log.action === "Check In"
                                          ? "green"
                                          : "red"
                                      }
                                      fontSize="xs"
                                    >
                                      {formatLogTimestamp(log.timestamp)}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600" ml={7}>
                                    {log.description}
                                  </Text>

                                  {/* Timeline connector */}
                                  {index < attendanceLogs.length - 1 && (
                                    <Box
                                      position="absolute"
                                      left="13px"
                                      bottom="-8px"
                                      w="2px"
                                      h="8px"
                                      bg="gray.200"
                                    />
                                  )}
                                </Box>
                              ))}
                          </VStack>
                        ) : (
                          <Box textAlign="center" py={8}>
                            <Icon
                              as={FaHistory}
                              w={8}
                              h={8}
                              color="gray.300"
                              mb={3}
                            />
                            <Text color="gray.500" fontSize="sm">
                              No activity logs available
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Employee Info Tab */}
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box
                          bg="white"
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor="gray.200"
                        >
                          <Heading size="sm" mb={4} color="gray.700">
                            <HStack>
                              <Icon as={FaBriefcase} color="purple.500" />
                              <Text>Professional Information</Text>
                            </HStack>
                          </Heading>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                Department:
                              </Text>
                              <Badge colorScheme="purple" variant="subtle">
                                {selectedEmployee.employee?.department || "N/A"}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                Position:
                              </Text>
                              <Badge colorScheme="blue" variant="subtle">
                                {selectedEmployee.employee?.role || "N/A"}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                Employment Type:
                              </Text>
                              <Badge colorScheme="green" variant="subtle">
                                {selectedEmployee.employee?.employmentType ||
                                  "Full-time"}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Quick Actions for Employee */}
                        <Box
                          bg="gradient-to-r"
                          bgGradient="linear(to-r, blue.50, purple.50)"
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor="blue.200"
                        >
                          <Heading size="sm" mb={3} color="gray.700">
                            Quick Actions
                          </Heading>
                          <HStack spacing={3}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FaSignInAlt />}
                              onClick={handleCheckIn}
                              isLoading={isCheckingIn}
                            >
                              Check In
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<FaSignOutAlt />}
                              onClick={handleCheckOut}
                              isLoading={isCheckingOut}
                            >
                              Check Out
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default EmployeeAttendanceTracker;
