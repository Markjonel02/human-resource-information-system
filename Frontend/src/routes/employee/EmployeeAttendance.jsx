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

const EmployeeAttendanceTracker = () => {
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
    dateFrom: "",
    dateTo: "",
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

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
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
          "/employeeAttendance/my-leave-credits"
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

  const handleAddAttendance = () => {
    setFormData({
      employeeId: loggedInUser._id || loggedInUser.id || "",
      date: "",
      status: "present",
      checkIn: "",
      checkOut: "",
      leaveType: "",
      notes: "",
      dateFrom: "",
      dateTo: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEditAttendance = (record) => {
    setCurrentRecord(record);
    setFormData({
      employeeId: record.employee._id,
      date: formatDate(record.date),
      status: record.status,
      checkIn: record.checkIn ? formatTime(record.checkIn) : "",
      checkOut: record.checkOut ? formatTime(record.checkOut) : "",
      leaveType: record.leaveType || "",
      notes: record.notes || "",
      dateFrom: record.dateFrom ? record.dateFrom.slice(0, 10) : "",
      dateTo: record.dateTo ? record.dateTo.slice(0, 10) : "",
    });
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Only send dateFrom/dateTo for leave
      let payload = { ...formData };
      if (formData.status !== "on_leave") {
        payload.dateFrom = "";
        payload.dateTo = "";
        payload.leaveType = "";
      }

      if (isAddModalOpen) {
        await axiosInstance.post("/employeeAttendance/my", payload);
        toast({
          title: "Success",
          description: "Attendance record added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (isEditModalOpen) {
        await axiosInstance.put(
          `/api/attendance/${currentRecord._id}`,
          payload
        );
        toast({
          title: "Success",
          description: "Attendance record updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setRefreshKey((prev) => prev + 1);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /*   const handleDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/attendance/${currentRecord._id}`);
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }; */

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
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddAttendance}
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
              <Th py={3} px={4} display={{ base: "none", xl: "table-cell" }}>
                Notes
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
                      <Text fontSize="sm" color="gray.900">
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
                  <Td px={4} py={4} textAlign="right">
                    <Menu placement="bottom-end" portal>
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList zIndex={1500}>
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => handleEditAttendance(record)}
                        >
                          Edit
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

      {/* Add Attendance Modal */}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Attendance Record</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired mb={0}>
                  <FormLabel>Employee</FormLabel>
                  <Input
                    value={
                      loggedInUser
                        ? `${loggedInUser.firstname || ""} ${
                            loggedInUser.lastname || ""
                          } (${loggedInUser.employeeId || ""})`
                        : ""
                    }
                    isReadOnly
                    bg="gray.100"
                  />
                </FormControl>

                {/* Show Date only for non-leave statuses (add modal) */}
                {formData.status !== "on_leave" && (
                  <FormControl isRequired mb={0}>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                    />
                  </FormControl>
                )}

                <FormControl isRequired mb={0}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="on_leave">On Leave</option>
                  </Select>
                </FormControl>

                {(formData.status === "present" ||
                  formData.status === "late") && (
                  <>
                    <FormControl mb={0}>
                      <FormLabel>Check-in Time</FormLabel>
                      <Input
                        type="time"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                    <FormControl mb={0}>
                      <FormLabel>Check-out Time</FormLabel>
                      <Input
                        type="time"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                  </>
                )}

                {formData.status === "on_leave" && (
                  <>
                    <FormControl isRequired mb={0} gridColumn="span 2">
                      <FormLabel>Leave Type</FormLabel>
                      <Select
                        name="leaveType"
                        value={formData.leaveType}
                        onChange={handleFormChange}
                      >
                        <option value="">Select leave type</option>
                        <option value="VL">Vacation Leave</option>
                        <option value="SL">Sick Leave</option>
                        <option value="LWOP">Leave Without Pay</option>
                        <option value="BL">Birthday Leave</option>
                        <option value="OS">Official Business</option>
                        <option value="CL">Compassionate Leave</option>
                      </Select>
                    </FormControl>
                    <FormControl isRequired mb={0}>
                      <FormLabel>Date From</FormLabel>
                      <Input
                        type="date"
                        name="dateFrom"
                        value={formData.dateFrom}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                    <FormControl isRequired mb={0}>
                      <FormLabel>Date To</FormLabel>
                      <Input
                        type="date"
                        name="dateTo"
                        value={formData.dateTo}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                  </>
                )}

                <FormControl mb={0} gridColumn="span 2">
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Additional notes..."
                  />
                </FormControl>
              </SimpleGrid>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={isLoading}
              >
                Save
              </Button>
              <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Attendance Record</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl mb={4}>
                  <FormLabel>Employee</FormLabel>
                  <Text fontWeight="bold">
                    {currentRecord?.employee?.firstname}{" "}
                    {currentRecord?.employee?.lastname}
                  </Text>
                </FormControl>

                {/* Show Date only for non-leave statuses (edit modal) */}
                {formData.status !== "on_leave" && (
                  <FormControl isRequired mb={4}>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                    />
                  </FormControl>
                )}
                <FormControl isRequired mb={4}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="on_leave">On Leave</option>
                  </Select>
                </FormControl>
                {formData.status === "present" || formData.status === "late" ? (
                  <>
                    <FormControl mb={4}>
                      <FormLabel>Check-in Time</FormLabel>
                      <Input
                        type="time"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>Check-out Time</FormLabel>
                      <Input
                        type="time"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                  </>
                ) : formData.status === "on_leave" ? (
                  <>
                    <FormControl isRequired mb={4}>
                      <FormLabel>Leave Type</FormLabel>
                      <Select
                        name="leaveType"
                        value={formData.leaveType}
                        onChange={handleFormChange}
                      >
                        <option value="">Select leave type</option>
                        <option value="VL">Vacation Leave</option>
                        <option value="SL">Sick Leave</option>
                        <option value="LWOP">Leave Without Pay</option>
                        <option value="BL">Birthday Leave</option>
                        <option value="OS">Official Business</option>
                        <option value="CL">Compassionate Leave</option>
                      </Select>
                    </FormControl>
                    <FormControl isRequired mb={4}>
                      <FormLabel>Date From</FormLabel>
                      <Input
                        type="date"
                        name="dateFrom"
                        value={formData.dateFrom}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                    <FormControl isRequired mb={4}>
                      <FormLabel>Date To</FormLabel>
                      <Input
                        type="date"
                        name="dateTo"
                        value={formData.dateTo}
                        onChange={handleFormChange}
                      />
                    </FormControl>
                  </>
                ) : null}
              </SimpleGrid>
              <FormControl mb={4}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Additional notes..."
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            </ModalFooter>
          </form>
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
                    <Tab>Attendance Record</Tab>
                    <Tab>Activity Logs</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Attendance Record Tab */}
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
                                  {selectedEmployee.checkIn
                                    ? formatTime(selectedEmployee.checkIn)
                                    : "-"}
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
                                      {selectedEmployee.checkOut
                                        ? formatTime(selectedEmployee.checkOut)
                                        : "-"}
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
                                  <Text
                                    fontSize="sm"
                                    color="gray.900"
                                    fontWeight="medium"
                                  >
                                    {calculateHoursRendered(
                                      record.checkIn,
                                      record.checkOut
                                    )}
                                  </Text>
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
                            {(selectedEmployee.dateFrom ||
                              selectedEmployee.dateTo) && (
                              <Text fontSize="sm" color="blue.800" mt={2}>
                                {selectedEmployee.dateFrom &&
                                selectedEmployee.dateTo
                                  ? `From: ${formatDate(
                                      selectedEmployee.dateFrom
                                    )} To: ${formatDate(
                                      selectedEmployee.dateTo
                                    )}`
                                  : selectedEmployee.dateFrom
                                  ? `From: ${formatDate(
                                      selectedEmployee.dateFrom
                                    )}`
                                  : selectedEmployee.dateTo
                                  ? `To: ${formatDate(selectedEmployee.dateTo)}`
                                  : null}
                              </Text>
                            )}
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

                    {/* Activity Logs Tab */}
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="sm" color="gray.700">
                          <HStack>
                            <Icon as={FaClock} color="indigo.500" />
                            <Text>Attendance Activity Logs</Text>
                          </HStack>
                        </Heading>

                        {Array.isArray(attendanceLogs) &&
                        attendanceLogs.length > 0 ? (
                          <VStack align="stretch" spacing={2}>
                            {attendanceLogs.slice(0, 10).map((log, index) => (
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
                                  <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    color="gray.800"
                                  >
                                    {log.action}
                                  </Text>
                                  <Badge colorScheme="gray" fontSize="xs">
                                    {formatLogTimestamp(log.timestamp)}
                                  </Badge>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
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
