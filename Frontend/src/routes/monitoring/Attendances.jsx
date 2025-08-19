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
  Select,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  AddIcon,
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
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";

// Helper function to parse time
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "-" || timeStr === "") return null;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};
const formatLogTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
// Helper function to convert minutes to time string
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

// Helper function to determine if employee should be marked as late
const shouldBeMarkedAsLate = (checkInTime, standardCheckIn = "08:00 AM") => {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const standardMinutes = parseTimeToMinutes(standardCheckIn);

  if (checkInMinutes === null || standardMinutes === null) return false;
  return checkInMinutes > standardMinutes;
};

// Helper function to calculate late minutes
const calculateLateMinutes = (checkInTime, standardCheckIn = "08:00 AM") => {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const standardMinutes = parseTimeToMinutes(standardCheckIn);

  if (checkInMinutes === null || standardMinutes === null) return 0;
  return Math.max(0, checkInMinutes - standardMinutes);
};

const Attendances = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Company settings - can be made configurable
  const [companySettings, setCompanySettings] = useState({
    standardCheckIn: "08:00 AM",
    standardCheckOut: "05:00 PM",
  });

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    status: "present",
    checkIn: "08:00 AM",
    checkOut: "05:00 PM",
    leaveType: "",
    notes: "",
  });
  const toast = useToast();

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/employees");
        setEmployees(response.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchEmployees();
  }, [toast]);

  // Fetch attendance records
  useEffect(() => {
    // Update your existing fetchAttendance function
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const params = {};

        if (searchTerm) {
          const statusMatch = searchTerm.match(/present|absent|late|leave/i);
          if (statusMatch) {
            params.status = statusMatch[0];
          } else {
            params.employee = searchTerm;
          }
        }

        const response = await axiosInstance.get("/get-attendance", {
          params,
        });
        setAttendanceRecords(response.data);
        setError(null);

        // Only fetch logs if needed (optimization)
        if (isDrawerOpen && selectedEmployee) {
          const logsResponse = await axiosInstance.get(
            `/attendance-logs/employee/${selectedEmployee.employee._id}`
          );
          setAttendanceLogs(logsResponse.data || []);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [searchTerm, refreshKey]);

  const handleAddRecord = async () => {
    try {
      if (!newRecord.employeeId || !newRecord.date) {
        toast({
          title: "Validation Error",
          description: "Please select an employee and date",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);

      // Auto-determine if late based on check-in time
      let status = newRecord.status;
      if (status === "present" && newRecord.checkIn) {
        if (
          shouldBeMarkedAsLate(
            newRecord.checkIn,
            companySettings.standardCheckIn
          )
        ) {
          status = "late";
        }
      }

      // Transform status to match backend expectations
      if (status === "Leave") status = "on_leave";

      const recordData = {
        employeeId: newRecord.employeeId,
        date: newRecord.date,
        status: status,
        checkIn:
          newRecord.status !== "absent" && newRecord.status !== "Leave"
            ? newRecord.checkIn
            : undefined,
        checkOut:
          newRecord.status !== "absent" && newRecord.status !== "Leave"
            ? newRecord.checkOut
            : undefined,
        leaveType:
          newRecord.status === "Leave" ? newRecord.leaveType : undefined,
        notes: newRecord.notes,
      };

      const response = await axiosInstance.post(
        "/create-attendance",
        recordData
      );

      // Add new record to the list and refresh
      setAttendanceRecords((prev) => [response.data.attendance, ...prev]);
      setRefreshKey((prev) => prev + 1);

      toast({
        title: "Success",
        description: `Attendance record added successfully${
          status === "late" ? " (Automatically marked as late)" : ""
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setNewRecord({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        status: "present",
        checkIn: companySettings.standardCheckIn,
        checkOut: companySettings.standardCheckOut,
        leaveType: "",
        notes: "",
      });

      onAddModalClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add record",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    try {
      setIsLoading(true);

      // Auto-determine if late based on check-in time
      let status = editingRecord.status;
      if (
        status === "Present" &&
        editingRecord.checkIn &&
        editingRecord.checkIn !== "-"
      ) {
        if (
          shouldBeMarkedAsLate(
            editingRecord.checkIn,
            companySettings.standardCheckIn
          )
        ) {
          status = "Late";
        }
      }

      const updateData = {
        status: status === "Leave" ? "on_leave" : status.toLowerCase(),
        checkIn:
          editingRecord.checkIn !== "-" ? editingRecord.checkIn : undefined,
        checkOut:
          editingRecord.checkOut !== "-" ? editingRecord.checkOut : undefined,
        leaveType:
          editingRecord.status === "Leave"
            ? editingRecord.leaveType
            : undefined,
        notes: editingRecord.notes,
      };

      const response = await axiosInstance.put(
        `/update-attendance/${editingRecord._id}`,
        updateData
      );

      // Update the record in the list and refresh
      setAttendanceRecords((prev) =>
        prev.map((rec) =>
          rec._id === editingRecord._id
            ? {
                ...editingRecord,
                ...response.data,
                status: status,
              }
            : rec
        )
      );
      setRefreshKey((prev) => prev + 1);

      toast({
        title: "Success",
        description: `Record updated successfully${
          status === "Late" ? " (Automatically marked as late)" : ""
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditModalClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update record",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setIsLoading(true);
        await axiosInstance.delete(`/delete-attendance/${id}`);
        setAttendanceRecords((prev) => prev.filter((rec) => rec._id !== id));
        setRefreshKey((prev) => prev + 1);
        toast({
          title: "Success",
          description: "Record deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete record",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
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
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };
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
    if (checkIn === "-" || checkOut === "-" || !checkIn || !checkOut)
      return "-";

    const checkInMinutes = parseTimeToMinutes(checkIn);
    const checkOutMinutes = parseTimeToMinutes(checkOut);

    if (
      checkInMinutes === null ||
      checkOutMinutes === null ||
      checkOutMinutes < checkInMinutes
    ) {
      return "-";
    }

    const totalMinutes = checkOutMinutes - checkInMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getTardiness = (record) => {
    if (record.status.toLowerCase() === "late" && record.checkIn) {
      const lateMinutes = calculateLateMinutes(
        record.checkIn,
        companySettings.standardCheckIn
      );
      if (lateMinutes > 0) {
        return `${lateMinutes} min late`;
      }
    }
    return "-";
  };

  const handleViewDetails = async (employee) => {
    setSelectedEmployee(employee);
    try {
      const logsResponse = await axiosInstance.get(
        `/attendance-logs/employee/${employee.employee._id}`
      );
      setAttendanceLogs(logsResponse.data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance logs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onDrawerOpen();
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    onEditModalOpen();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => {
      const updatedRecord = { ...prev, [name]: value };

      if (name === "status") {
        if (value === "Absent" || value === "Leave") {
          updatedRecord.checkIn = "-";
          updatedRecord.checkOut = "-";
        } else if (prev.status === "Absent" || prev.status === "Leave") {
          updatedRecord.checkIn = companySettings.standardCheckIn;
          updatedRecord.checkOut = companySettings.standardCheckOut;
        }

        if (value !== "Leave") {
          updatedRecord.leaveType = null;
        }
      }

      return updatedRecord;
    });
  };

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "status") {
        if (value === "absent" || value === "Leave") {
          updated.checkIn = "";
          updated.checkOut = "";
        } else {
          updated.checkIn = companySettings.standardCheckIn;
          updated.checkOut = companySettings.standardCheckOut;
        }

        if (value !== "Leave") {
          updated.leaveType = "";
        }
      }

      return updated;
    });
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
            Attendance Tracking
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Last updated: {new Date().toLocaleString()}
          </Text>
        </VStack>
        <HStack
          spacing={4}
          direction={{ base: "column", sm: "row" }}
          w={{ base: "full", md: "auto" }}
        >
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onAddModalOpen}
            size={{ base: "sm", md: "md" }}
          >
            Add Attendance
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
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="md"
          borderLeft="4px"
          borderColor="green.400"
        >
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
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="md"
          borderLeft="4px"
          borderColor="orange.400"
        >
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
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="md"
          borderLeft="4px"
          borderColor="red.400"
        >
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
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="md"
          borderLeft="4px"
          borderColor="blue.400"
        >
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
        </Box>
      </SimpleGrid>

      {/* Leave Breakdown */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4} color="gray.700">
          Leave Breakdown
        </Heading>
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
      </Box>

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
      <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
        <Table variant="simple" minW="full">
          <Thead bg="gray.50">
            <Tr>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Employee
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", md: "table-cell" }}
              >
                Date
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Status
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", lg: "table-cell" }}
              >
                Check-in
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", lg: "table-cell" }}
              >
                Check-out
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", xl: "table-cell" }}
              >
                Hours
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", xl: "table-cell" }}
              >
                Leave Type
              </Th>
              
              <Th
                py={3}
                px={4}
                textAlign="right"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
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
                      <Text fontSize="sm" color="gray.900">
                        {record.checkIn || "-"}
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
                        {record.checkOut || "-"}
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
                        <MenuItem onClick={() => handleEditRecord(record)}>
                          Edit Record
                        </MenuItem>
                        <MenuItem onClick={() => handleViewDetails(record)}>
                          View Details
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteRecord(record._id)}
                          color="red.600"
                        >
                          Delete Record
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Add Attendance Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader bg="blue.500" color="white" borderTopRadius="md">
            <HStack spacing={3}>
              <Icon as={AddIcon} />
              <Text>Add New Attendance Record</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Auto Late Detection Enabled
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Check-in after {companySettings.standardCheckIn} will
                  automatically mark as late
                </Text>
              </VStack>
            </Alert>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Employee</FormLabel>
                <Select
                  placeholder="Select employee"
                  name="employeeId"
                  value={newRecord.employeeId}
                  onChange={handleNewRecordChange}
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstname} {emp.lastname} ({emp.employeeId})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={newRecord.date}
                  onChange={handleNewRecordChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={newRecord.status}
                  onChange={handleNewRecordChange}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late (Manual)</option>
                  <option value="Leave">Leave</option>
                </Select>
              </FormControl>

              {newRecord.status === "Leave" && (
                <FormControl isRequired>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    name="leaveType"
                    value={newRecord.leaveType}
                    onChange={handleNewRecordChange}
                    placeholder="Select Leave Type"
                  >
                    <option value="VL">Vacation Leave (VL)</option>
                    <option value="SL">Sick Leave (SL)</option>
                    <option value="LWOP">Leave Without Pay (LWOP)</option>
                    <option value="BL">Bereavement Leave (BL)</option>
                    <option value="OS">Offset (OS)</option>
                    <option value="CL">Calamity Leave (CL)</option>
                  </Select>
                </FormControl>
              )}

              {(newRecord.status === "present" ||
                newRecord.status === "late") && (
                <>
                  <FormControl>
                    <FormLabel>
                      Check-in Time
                      {shouldBeMarkedAsLate(
                        newRecord.checkIn,
                        companySettings.standardCheckIn
                      ) && (
                        <Badge colorScheme="orange" ml={2} fontSize="xs">
                          Will mark as LATE
                        </Badge>
                      )}
                    </FormLabel>
                    <Input
                      type="text"
                      name="checkIn"
                      placeholder="e.g., 08:00 AM"
                      value={newRecord.checkIn}
                      onChange={handleNewRecordChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Check-out Time</FormLabel>
                    <Input
                      type="text"
                      name="checkOut"
                      placeholder="e.g., 05:00 PM"
                      value={newRecord.checkOut}
                      onChange={handleNewRecordChange}
                    />
                  </FormControl>
                </>
              )}
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Notes (Optional)</FormLabel>
              <Textarea
                name="notes"
                placeholder="Additional notes..."
                value={newRecord.notes}
                onChange={handleNewRecordChange}
                resize="vertical"
                rows={3}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter bg="gray.50" borderBottomRadius="md">
            <Button variant="ghost" onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              ml={3}
              onClick={handleAddRecord}
              isLoading={isLoading}
              isDisabled={!newRecord.employeeId || !newRecord.date}
            >
              Add Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                    <Tab>Employee Info</Tab>
                    <Tab>Logs</Tab>
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

                        {selectedEmployee.checkIn &&
                          selectedEmployee.checkIn !== "-" && (
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
                                  "N/A"}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                    </TabPanel>

                    {/* Logs Tab */}
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="sm" color="gray.700">
                          <HStack>
                            <Icon as={FaHistory} color="indigo.500" />
                            <Text>Recent Activity Logs</Text>
                          </HStack>
                        </Heading>

                        {attendanceLogs.length > 0 ? (
                          <VStack align="stretch" spacing={2}>
                            {attendanceLogs
                              .filter(
                                (log) =>
                                  log.employeeId ===
                                  selectedEmployee.employee?._id
                              )
                              .slice(0, 5)
                              .map((log, index) => (
                                <Box
                                  key={index}
                                  bg="white"
                                  p={3}
                                  borderRadius="md"
                                  border="1px"
                                  borderColor="gray.200"
                                >
                                  <HStack justify="space-between" mb={1}>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="medium"
                                      color="gray.800"
                                    >
                                      {log.action}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {formatDate(log.timestamp)}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600">
                                    {log.description}
                                  </Text>
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
                              No recent logs available
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Edit Record Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader bg="orange.500" color="white" borderTopRadius="md">
            <HStack spacing={3}>
              <Icon as={FaClock} />
              <Text>Edit Attendance Record</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            {editingRecord && (
              <>
                <Alert status="info" mb={4} borderRadius="md">
                  <AlertIcon />
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Auto Late Detection Active
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Changes to check-in time will automatically update status
                      if needed
                    </Text>
                  </VStack>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Employee</FormLabel>
                    <Input
                      value={`${editingRecord.employee?.firstname || "N/A"} ${
                        editingRecord.employee?.lastname || ""
                      } (${editingRecord.employee?.employeeId || "N/A"})`}
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Date</FormLabel>
                    <Input
                      value={formatDate(editingRecord.date)}
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      name="status"
                      value={editingRecord.status}
                      onChange={handleEditChange}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Leave">Leave</option>
                    </Select>
                  </FormControl>

                  {editingRecord.status === "Leave" && (
                    <FormControl>
                      <FormLabel>Leave Type</FormLabel>
                      <Select
                        name="leaveType"
                        value={editingRecord.leaveType || ""}
                        onChange={handleEditChange}
                        placeholder="Select Leave Type"
                      >
                        <option value="VL">Vacation Leave (VL)</option>
                        <option value="SL">Sick Leave (SL)</option>
                        <option value="LWOP">Leave Without Pay (LWOP)</option>
                        <option value="BL">Bereavement Leave (BL)</option>
                        <option value="OS">Offset (OS)</option>
                        <option value="CL">Calamity Leave (CL)</option>
                      </Select>
                    </FormControl>
                  )}

                  {(editingRecord.status === "Present" ||
                    editingRecord.status === "Late") && (
                    <>
                      <FormControl>
                        <FormLabel>
                          Check-in Time
                          {editingRecord.checkIn &&
                            editingRecord.checkIn !== "-" &&
                            shouldBeMarkedAsLate(
                              editingRecord.checkIn,
                              companySettings.standardCheckIn
                            ) && (
                              <Badge colorScheme="orange" ml={2} fontSize="xs">
                                Will mark as LATE
                              </Badge>
                            )}
                        </FormLabel>
                        <Input
                          type="text"
                          name="checkIn"
                          placeholder="e.g., 09:00 AM"
                          value={
                            editingRecord.checkIn === "-"
                              ? ""
                              : editingRecord.checkIn
                          }
                          onChange={handleEditChange}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Check-out Time</FormLabel>
                        <Input
                          type="text"
                          name="checkOut"
                          placeholder="e.g., 05:00 PM"
                          value={
                            editingRecord.checkOut === "-"
                              ? ""
                              : editingRecord.checkOut
                          }
                          onChange={handleEditChange}
                        />
                      </FormControl>
                    </>
                  )}
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    name="notes"
                    placeholder="Additional notes..."
                    value={editingRecord.notes || ""}
                    onChange={handleEditChange}
                    resize="vertical"
                    rows={3}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderBottomRadius="md">
            <Button variant="ghost" onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              ml={3}
              onClick={handleSaveRecord}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Attendances;
