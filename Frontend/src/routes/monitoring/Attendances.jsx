/* // Main component: Attendances.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Box, Alert, AlertIcon, useDisclosure } from "@chakra-ui/react";
import LoadingSpinner from "../../components/attendanceComponents/LoadSpinners";
import AttendanceHeader from "../../components/attendanceComponents/AttendanceHeader";
import AttendanceStats from "../../components/attendanceComponents/AttendanceStats";
import AttendanceTable from "../../components/attendanceComponents/AttendanceTable";
import EmployeeDetailsDrawer from "../../components/attendanceComponents/EmployeeDetailsDrawer";
import EditRecordModal from "../../components/attendanceComponents/EditRecordModal";
import { useAttendance } from "../../hooks/useAttendance";
import { useAttendanceFilters } from "../../hooks/useAttendanceFilters";
import { useAttendanceStats } from "../../hooks/useAttendanceStats";
import useDebounce from "../../hooks/useDebounce";
const Attendances = () => {
  const {
    attendanceRecords,
    isLoading,
    error,
    fetchAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  } = useAttendance();

  const {
    searchTerm,
    setSearchTerm,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    filteredAttendance,
  } = useAttendanceFilters(attendanceRecords);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const stats = useAttendanceStats(filteredAttendance);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  // Fetch attendance data when filters change
  useEffect(() => {
    const params = {
      month: selectedMonth,
      year: selectedYear,
      status: debouncedSearchTerm.match(/present|absent|late|leave/i)?.[0],
      employee: debouncedSearchTerm,
    };
    fetchAttendance(params);
  }, [debouncedSearchTerm, selectedMonth, selectedYear, fetchAttendance]);

  const handleViewDetails = useCallback(
    (employee) => {
      setSelectedEmployee(employee);
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  const handleEditRecord = useCallback(
    (record) => {
      setEditingRecord(record);
      onModalOpen();
    },
    [onModalOpen]
  );

  const handleSaveRecord = useCallback(
    async (updatedRecord) => {
      try {
        await updateAttendanceRecord(updatedRecord._id, updatedRecord);
        onModalClose();
        setEditingRecord(null);
      } catch (error) {
        console.error("Failed to update record:", error);
      }
    },
    [updateAttendanceRecord, onModalClose]
  );

  const handleDeleteRecord = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this record?")) {
        try {
          await deleteAttendanceRecord(id);
        } catch (error) {
          console.error("Failed to delete record:", error);
        }
      }
    },
    [deleteAttendanceRecord]
  );

  return (
    <Box
      minH="100vh"
      p={{ base: 4, sm: 6, lg: 8 }}
      bg="gray.50"
      fontFamily="sans-serif"
    >
      {isLoading && <LoadingSpinner />}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <AttendanceHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <AttendanceStats stats={stats} />

      <AttendanceTable
        filteredAttendance={filteredAttendance}
        onEdit={handleEditRecord}
        onView={handleViewDetails}
        onDelete={handleDeleteRecord}
      />

      <EmployeeDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        selectedEmployee={selectedEmployee}z
      />

      <EditRecordModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        record={editingRecord}
        onSave={handleSaveRecord}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Attendances;
 */

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
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { FaUserTie, FaBriefcase, FaFileAlt } from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";
// Replace this with your actual axiosInstance import
// import axiosInstance from "../../lib/axiosInstance";

// Mock axiosInstance for demo - replace with your actual implementation
/* const axiosInstance = {
  get: async (url, config) => {
    // Mock response for employees
    if (url === "/employees") {
      return {
        data: [
          {
            _id: "1",
            firstname: "John",
            lastname: "Doe",
            employeeId: "EMP001",
            department: "IT",
            role: "Developer",
            employmentType: "Full-time",
          },
          {
            _id: "2",
            firstname: "Jane",
            lastname: "Smith",
            employeeId: "EMP002",
            department: "HR",
            role: "Manager",
            employmentType: "Full-time",
          },
        ],
      };
    }

    // Mock response for attendance
    if (url === "/get-attendance") {
      return {
        data: [
          {
            _id: "att1",
            employee: {
              _id: "1",
              firstname: "John",
              lastname: "Doe",
              employeeId: "EMP001",
              department: "IT",
              role: "Developer",
              employmentType: "Full-time",
            },
            date: new Date().toISOString(),
            status: "Present",
            checkIn: "09:00 AM",
            checkOut: "05:00 PM",
            hoursRendered: 480,
            tardinessMinutes: 0,
            leaveType: null,
            notes: "",
          },
        ],
      };
    }

    return { data: [] };
  },
  post: async (url, data) => {
    // Mock response for adding attendance
    const mockRecord = {
      _id: Date.now().toString(),
      employee: {
        _id: data.employeeId,
        firstname: "New",
        lastname: "Employee",
        employeeId: "EMP003",
        department: "Finance",
        role: "Analyst",
        employmentType: "Full-time",
      },
      date: data.date,
      status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
      checkIn: data.checkIn || "-",
      checkOut: data.checkOut || "-",
      hoursRendered: 480,
      tardinessMinutes: 0,
      leaveType: data.leaveType || null,
      notes: data.notes || "",
    };

    return { data: { attendance: mockRecord } };
  },
  put: async (url, data) => {
    // Mock response for updating attendance
    return { data: { ...data, _id: url.split("/").pop() } };
  },
  delete: async (url) => {
    // Mock response for deleting attendance
    return { data: { message: "Deleted successfully" } };
  },
}; */

// Helper function to parse time
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "-") return null;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

const Attendances = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Company settings - can be made configurable
  const [companySettings, setCompanySettings] = useState({
    standardCheckIn: "09:00 AM",
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
    checkIn: "09:00 AM",
    checkOut: "05:00 PM",
    leaveType: "",
    notes: "",
  });
  const toast = useToast();

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
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const params = {};

        if (searchTerm) {
          // Check if search term matches status
          const statusMatch = searchTerm.match(/present|absent|late|leave/i);
          if (statusMatch) {
            params.status = statusMatch[0];
          } else {
            params.employee = searchTerm;
          }
        }

        const response = await axiosInstance.get("/get-attendance", { params });
        setAttendanceRecords(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [searchTerm]);

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

      // Transform status to match backend expectations
      let status = newRecord.status;
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

      // Add new record to the list
      setAttendanceRecords((prev) => [response.data.attendance, ...prev]);

      toast({
        title: "Success",
        description: "Attendance record added successfully",
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

      const updateData = {
        status:
          editingRecord.status === "Leave"
            ? "on_leave"
            : editingRecord.status.toLowerCase(),
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

      // Update the record in the list
      setAttendanceRecords((prev) =>
        prev.map((rec) =>
          rec._id === editingRecord._id
            ? {
                ...editingRecord,
                ...response.data,
              }
            : rec
        )
      );

      toast({
        title: "Success",
        description: "Record updated successfully",
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

  const { totalMinLate, numLate, numAbsent, leaveCounts } = useMemo(() => {
    let totalMinLate = 0;
    let numLate = 0;
    let numAbsent = 0;
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };

    filteredAttendance.forEach((record) => {
      if (record.status.toLowerCase() === "late" && record.checkIn) {
        const checkInMinutes = parseTimeToMinutes(record.checkIn);
        const scheduledCheckInMinutes = parseTimeToMinutes(
          companySettings.standardCheckIn
        );
        if (checkInMinutes !== null && scheduledCheckInMinutes !== null) {
          const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
          if (lateMinutes > 0) {
            totalMinLate += lateMinutes;
            numLate++;
          }
        }
      } else if (record.status.toLowerCase() === "absent") {
        numAbsent++;
      } else if (
        (record.status.toLowerCase() === "leave" ||
          record.status.toLowerCase() === "on_leave") &&
        record.leaveType
      ) {
        if (leaveCounts.hasOwnProperty(record.leaveType)) {
          leaveCounts[record.leaveType]++;
        }
      }
    });

    return { totalMinLate, numLate, numAbsent, leaveCounts };
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
      const checkInMinutes = parseTimeToMinutes(record.checkIn);
      const scheduledCheckInMinutes = parseTimeToMinutes(
        companySettings.standardCheckIn
      );
      if (checkInMinutes !== null && scheduledCheckInMinutes !== null) {
        const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
        if (lateMinutes > 0) {
          return `${lateMinutes} min late`;
        }
      }
    }
    return "-";
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
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
        >
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}

      {error && (
        <Alert status="error" mb={4}>
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
        <Heading
          as="h1"
          fontSize={{ base: "2xl", sm: "3xl" }}
          fontWeight="bold"
          color="gray.800"
          mb={{ base: 4, md: 0 }}
        >
          Attendance Tracking
        </Heading>
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

      {/* Statistics Section */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">
            Tardiness & Attendance
          </Heading>
          <VStack align="flex-start" spacing={3}>
            <Stat>
              <StatLabel color="gray.600">Total Late Time</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold" color="orange.600">
                {Math.floor(totalMinLate / 60)}h {totalMinLate % 60}m
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Late Entries</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold" color="orange.600">
                {numLate}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Absences</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold" color="red.600">
                {numAbsent}
              </StatNumber>
            </Stat>
          </VStack>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">
            Leave Summary
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                VL
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.VL}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                SL
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.SL}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                LWOP
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.LWOP}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                BL
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.BL}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                OS
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.OS}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.600" fontSize="xs">
                CL
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.600">
                {leaveCounts.CL}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
      </SimpleGrid>

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
                  <Text color="gray.500">No attendance records found</Text>
                </Td>
              </Tr>
            ) : (
              filteredAttendance.map((record) => (
                <Tr key={record._id} _hover={{ bg: "gray.50" }}>
                  <Td px={4} py={4}>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {record.employee?.firstname || "N/A"}{" "}
                        {record.employee?.lastname || ""}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {record.employee?.employeeId || "N/A"}
                      </Text>
                    </VStack>
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
                    <Tag
                      size="sm"
                      variant="subtle"
                      colorScheme={getStatusColorScheme(record.status)}
                    >
                      {capitalizeStatus(record.status)}
                    </Tag>
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
                    <Text fontSize="sm" color="gray.900">
                      {calculateHoursRendered(record.checkIn, record.checkOut)}
                    </Text>
                  </Td>
                  <Td
                    px={4}
                    py={4}
                    display={{ base: "none", xl: "table-cell" }}
                  >
                    <Text fontSize="sm" color="gray.900">
                      {record.leaveType || "-"}
                    </Text>
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
          <ModalHeader>Add New Attendance Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  <option value="late">Late</option>
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
                    <FormLabel>Check-in Time</FormLabel>
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

          <ModalFooter>
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

      {/* Employee Details Drawer */}
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
            borderBottomWidth="1px"
            fontSize="lg"
            fontWeight="bold"
            color="gray.800"
          >
            Employee Attendance Details
          </DrawerHeader>

          <DrawerBody p={6}>
            {selectedEmployee && (
              <VStack align="stretch" spacing={6}>
                <Flex
                  align="center"
                  pb={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <Avatar
                    size="lg"
                    name={`${selectedEmployee.employee?.firstname || ""} ${
                      selectedEmployee.employee?.lastname || ""
                    }`}
                    bg="blue.500"
                    color="white"
                    mr={4}
                  />
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {selectedEmployee.employee?.firstname || "N/A"}{" "}
                      {selectedEmployee.employee?.lastname || ""}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {selectedEmployee.employee?.employeeId || "N/A"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {selectedEmployee.employee?.role || "N/A"} -{" "}
                      {selectedEmployee.employee?.department || "N/A"}
                    </Text>
                  </VStack>
                </Flex>

                <Box bg="blue.50" p={4} borderRadius="md">
                  <Heading size="sm" mb={3} color="gray.700">
                    Employee Information
                  </Heading>
                  <SimpleGrid columns={1} spacing={2}>
                    <HStack>
                      <Icon as={FaBriefcase} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Department:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.department || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaUserTie} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Role:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.role || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaFileAlt} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Employment Type:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.employmentType || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </Box>

                <Box bg="green.50" p={4} borderRadius="md">
                  <Heading size="sm" mb={3} color="gray.700">
                    Attendance Details
                  </Heading>
                  <SimpleGrid columns={1} spacing={3}>
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        textTransform="uppercase"
                        letterSpacing="wide"
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
                        color="gray.600"
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Status
                      </Text>
                      <Tag
                        size="md"
                        colorScheme={getStatusColorScheme(
                          selectedEmployee.status
                        )}
                        mt={1}
                      >
                        {capitalizeStatus(selectedEmployee.status)}
                      </Tag>
                    </Box>
                    {selectedEmployee.checkIn &&
                      selectedEmployee.checkIn !== "-" && (
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Check-in Time
                          </Text>
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            {selectedEmployee.checkIn}
                          </Text>
                        </Box>
                      )}
                    {selectedEmployee.checkOut &&
                      selectedEmployee.checkOut !== "-" && (
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Check-out Time
                          </Text>
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            {selectedEmployee.checkOut}
                          </Text>
                        </Box>
                      )}
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Hours Worked
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight="semibold"
                        color="gray.800"
                      >
                        {calculateHoursRendered(
                          selectedEmployee.checkIn,
                          selectedEmployee.checkOut
                        )}
                      </Text>
                    </Box>
                    {selectedEmployee.leaveType && (
                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.600"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Leave Type
                        </Text>
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {selectedEmployee.leaveType}
                        </Text>
                      </Box>
                    )}
                    {getTardiness(selectedEmployee) !== "-" && (
                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.600"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Tardiness
                        </Text>
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          color="orange.600"
                        >
                          {getTardiness(selectedEmployee)}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>

                {selectedEmployee.notes && (
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Heading size="sm" mb={2} color="gray.700">
                      Notes
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {selectedEmployee.notes}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Edit Record Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>Edit Attendance Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingRecord && (
              <>
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
                        <FormLabel>Check-in Time</FormLabel>
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

          <ModalFooter>
            <Button variant="ghost" onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
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
