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
  Select,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  WarningIcon,
  CheckCircleIcon,
  InfoIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import {
  FaUserTie,
  FaBriefcase,
  FaFileAlt,
  FaClock,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import axiosInstance from "../../lib/axiosInstance";

// Helper functions
const parseTimeToMinutes = (timeStr) => {
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

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const capitalizeStatus = (status) => {
  if (status.toLowerCase() === "on_leave") return "Leave";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const EmployeAttendanceTracking = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [employees, setEmployees] = useState([]); // Initialize as empty array
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [leaveCredits, setLeaveCredits] = useState({});
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    status: "present",
    checkIn: "",
    checkOut: "",
    leaveType: "",
    notes: "",
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
  });

  const toast = useToast();
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  // Fetch attendance records and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch employee's own attendance records
        const attendanceResponse = await axiosInstance.get(
          "/employeeAttendance/my"
        );
        setAttendanceRecords(
          Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []
        );

        // Fetch employee's leave credits
        const leaveCreditsResponse = await axiosInstance.get(
          "/employeeLeave/my-leave-credits"
        );
        setLeaveCredits(leaveCreditsResponse.data?.credits || {});

        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey, toast]);

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

    if (checkOutTime <= checkInTime) return "0h 0m";

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
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };
    const absentEmployees = [];

    filteredAttendance.forEach((record) => {
      const normalizedStatus = record.status.toLowerCase();

      if (normalizedStatus === "late") {
        numLate++;
        if (record.checkIn) {
          totalMinLate += record.tardinessMinutes || 0;
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
  }, [filteredAttendance]);

  const getAttendanceRate = () => {
    const total = filteredAttendance.length;
    if (total === 0) return 0;
    return Math.round((numPresent / total) * 100);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const truncateText = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: false,
    xl: true,
  });

  return (
    <Box minH="100vh" p={{ base: 4, sm: 6, lg: 5 }} fontFamily="sans-serif">
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
            Manual Attendance Management
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
      <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} spacing={6} mb={6}>
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

      {/* Leave Breakdown */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md" color="gray.700">
            Leave Credits
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
            {Object.entries(leaveCredits).map(([type, credit]) => (
              <VStack key={type} bg="blue.50" p={3} borderRadius="md">
                <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                  {type}
                </Text>
                <Text fontSize="sm" color="blue.700">
                  {credit.remaining} / {credit.total}
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
              <Th py={3} px={3} display={{ base: "none", md: "table-cell" }}>
                Date
              </Th>
              <Th py={3} px={3}>
                Status
              </Th>
              <Th py={3} px={3} display={{ base: "none", lg: "table-cell" }}>
                Check-in
              </Th>
              <Th py={3} px={3} display={{ base: "none", lg: "table-cell" }}>
                Check-out
              </Th>
              <Th py={3} px={3} display={{ base: "none", xl: "table-cell" }}>
                Hours
              </Th>
              <Th py={3} px={3} display={{ base: "none", xl: "table-cell" }}>
                Leave Type
              </Th>
              <Th py={3} px={3} display={{ base: "none", xl: "table-cell" }}>
                Notes
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
                      <VStack align="flex-start" spacing={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                          isTruncated={truncateText}
                          maxW={truncateText ? "70px" : "none"}
                          title={`${record.employee?.firstname || "N/A"} ${
                            record.employee?.lastname || ""
                          }`}
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
                      <Tooltip>
                        <Text
                          fontSize="sm"
                          color="gray.900"
                          isTruncated={truncateText}
                          maxW={truncateText ? "80px" : "none"}
                        >
                          {formatDate(record.date)}
                        </Text>
                      </Tooltip>
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
                          fontWeight="sm"
                          isTruncated={truncateText}
                          maxW={truncateText ? "100px" : "none"}
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
                      <Text
                        fontSize="sm"
                        color="gray.900"
                        isTruncated={truncateText}
                        maxW={truncateText ? "50px" : "none"}
                        title={
                          record.checkIn ? formatTime(record.checkIn) : "-"
                        }
                      >
                        {record.checkIn ? formatTime(record.checkIn) : "-"}
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
                      <Text
                        fontSize="sm"
                        color="gray.900"
                        isTruncated={truncateText}
                        maxW={truncateText ? "50px" : "none"}
                        title={
                          record.checkOut ? formatTime(record.checkOut) : "-"
                        }
                      >
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
                      {record.hoursRendered !== undefined &&
                      record.hoursRendered !== null
                        ? `${Math.floor(record.hoursRendered / 60)}h ${
                            record.hoursRendered % 60
                          }m`
                        : "-"}
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
                  <Td
                    px={4}
                    py={4}
                    maxW="200px"
                    display={{ base: "none", xl: "table-cell" }}
                  >
                    <Text isTruncated title={record.notes || ""}>
                      {record.notes
                        ? record.notes.length > 5
                          ? `${record.notes.substring(0, 5)}...`
                          : record.notes
                        : "-"}
                    </Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Add Attendance Modal */}
    </Box>
  );
};

export default EmployeAttendanceTracking;
